import openai
import json
import re
from openai import AzureOpenAI

# --------------------
# ND & IL Tillage Options
# --------------------
tillage_options_nd = [
    {
        "name": "No-Till Planting (Farmer Owned)",
        "type": "Air Drill No-Till Planter",
        "working_speed_mph": 4.5,
        "soil_type": "Silt Loam",
        "width_ft": 40,
        "operating_cost_per_acre": 47.5
    },
    {
        "name": "Air Seeder with Disc Coulters (Farmer Owned - for Wheat/Small Grains)",
        "type": "Air Seeder with Independent Disc Coulters (minimal tillage seeding)",
        "working_speed_mph": 5,
        "soil_type": "Silt Loam",
        "width_ft": 50,
        "operating_cost_per_acre": 39
    },
    {
        "name": "Vertical Tillage (Farmer Owned - Light Residue Management)",
        "type": "Light Vertical Tillage Tool (e.g., Sunflower or Landoll type)",
        "working_speed_mph": 6,
        "soil_type": "Silt Loam",
        "width_ft": 35,
        "operating_cost_per_acre": 42.5
    },
    {
        "name": "Custom Strip-Till Application through Co-op Hired Resource",
        "hired_resource": "Commercial Strip-Till Service",
        "cost_per_acre": 55,
        "tillage_mechanism": "Strip-Till Implement (8-row or 12-row unit)",
        "estimated_time_hours_per_acre": 0.2
    },
    {
        "name": "Custom Heavy Discing through Co-op Hired Resource",
        "hired_resource": "Commercial Heavy Discing Service",
        "cost_per_acre": 50,
        "tillage_mechanism": "Large Offset Disc Harrow (aggressive residue incorporation)",
        "estimated_time_hours_per_acre": 0.3
    }
]

tillage_options_il = [
    {
        "name": "No-Till Planting (Farmer Owned)",
        "type": "16-row No-Till Planter",
        "working_speed_mph": 5,
        "soil_type": "Silty Clay Loam",
        "width_ft": 30,
        "operating_cost_per_acre": 55,
        "total_cost": 847
    },
    {
        "name": "High-Speed Disk (Farmer Owned - Secondary Tillage/Seedbed Prep)",
        "type": "High-Speed Disk (e.g., Salford Halo or similar)",
        "working_speed_mph": 8,
        "soil_type": "Silty Clay Loam",
        "width_ft": 30,
        "operating_cost_per_acre": 50,
        "total_cost": 770
    },
    {
        "name": "Conventional Disk Harrow (Farmer Owned - Secondary Tillage)",
        "type": "Large Tandem Disc Harrow",
        "working_speed_mph": 6,
        "soil_type": "Silty Clay Loam",
        "width_ft": 35,
        "operating_cost_per_acre": 60,
        "total_cost": 924
    },
    {
        "name": "Custom Deep Rip with Cover Crop Seeding through Co-op Hired Resource",
        "hired_resource": "Commercial Deep Rip and Cover Crop Service",
        "cost_per_acre": 75,
        "tillage_mechanism": "Deep Ripper with Cover Crop Seeder Attachment",
        "estimated_time_hours_per_acre": 0.4,
        "total_cost": 1155
    },
    {
        "name": "Custom Moldboard Plowing through Co-op Hired Resource",
        "hired_resource": "Commercial Moldboard Plowing Service",
        "cost_per_acre": 90,
        "tillage_mechanism": "Large Moldboard Plow",
        "estimated_time_hours_per_acre": 0.5,
        "total_cost": 1386
    }
]

# --------------------
# Soil Descriptions
# --------------------
ill_soil_desc = (
    "Your soil is predominantly clay-heavy, poorly drained, and prone to ponding, requiring careful tillage "
    "to improve water movement and prevent compaction. The majority (74.2%) of your land is Reddick clay loam "
    "(594A), which holds water for long periods due to its high clay content and slow infiltration rate "
    "(0.06 to 0.20 in/hr). The water table is extremely shallow (0 to 12 inches), leading to frequent ponding. "
    "However, it retains a high amount of moisture (~9.1 inches in the top 60 inches), which is beneficial in "
    "dry conditions. It is prime farmland only if properly drained, making drainage and aeration a top priority "
    "for tillage. Andres silt loam (293A) covers 18.8% of your land and is somewhat poorly drained, but more "
    "workable than the Reddick clay. It has a slightly deeper water table (12 to 24 inches), better drainage, "
    "and is classified as prime farmland. However, its low infiltration rate still makes it vulnerable to "
    "waterlogging if improperly managed. The smallest section (7%) is Ashkum silty clay loam (232A), another "
    "poorly drained soil with frequent ponding and a very shallow water table (0 to 12 inches). It compacts "
    "easily and stays wet for long periods, though it has moderate water-holding capacity (~8.1 inches in the "
    "top 60 inches). Like the Reddick soil, it is prime farmland only if drained properly. Overall, your soil "
    "is highly compactable and holds water too well, creating drainage issues. Tillage should focus on reducing "
    "compaction, improving drainage, and maintaining soil structure. Deep tillage or strip tillage would be "
    "more effective than aggressive plowing, which could worsen compaction. While your soil is naturally "
    "fertile, managing water retention and aeration is crucial for crop success."
)

nd_soil_desc = ""

# --------------------
# Chatbot Class
# --------------------
class Chatbot:
    def __init__(self, location, budget, crops):
        self.user_info = {"Location": location, "Budget": budget, "Crops": crops}
        self.total_area = 0
        self.soil = ""
        # Choose the toolstack depending on location
        if self.user_info["Location"] == "Illinois":
            self.toolstack = json.dumps(tillage_options_il, indent=2)
            self.total_area = 15.4
            self.soil = ill_soil_desc
        elif self.user_info["Location"] == "North Dakota":
            self.toolstack = json.dumps(tillage_options_nd, indent=2)
            # Could set self.total_area for ND if needed
            self.soil = nd_soil_desc
        else:
            self.toolstack = "[]"

        # Azure OpenAI credentials
        self.AZURE_OPENAI_API_KEY = ""
        self.AZURE_OPENAI_ENDPOINT = "https://openai-agco-poc.openai.azure.com"
        self.AZURE_API_VERSION = "2024-10-21"

        # Deployment name
        self.model_deployment = "gpt-4o-2"

        # System instructions
        self.message_history = [
            {
                "role": "system",
                "content": (
                    "You are an advanced agricultural AI assistant. Your goal is to evaluate each tillage tool "
                    "from the provided JSON list and estimate the profit for using that tool under the given farm "
                    "conditions. For each tool, provide:\n"
                    " - An estimated profit value (in $ per acre) based on its operating costs and assumed yield improvements,\n"
                    " - A brief explanation of how you arrived at that profit estimate.\n\n"
                    "After processing all tools, output the results in the following exact format:\n\n"
                    "Profits: tool1_name: estimated_profit, tool2_name: estimated_profit, ...\n"
                    "Explanations: tool1_name: explanation, tool2_name: explanation, ...\n"
                    "External Tool: (Recommend one third-party external tool with its price that would enhance efficiency.)\n\n"
                    "The list of available tillage options is provided in the user message under 'My tools'.\n"
                    "Always adhere exactly to the requested format."
                ),
            }
        ]

        # Data placeholders
        self.profitDict = {}
        self.explanations_part = ""
        self.externDict = {}
        self.external_tool_expl = ""
        self.schedule_text = ""  # to store the schedule part if needed

    # --- Helper to parse colon-separated strings to dict
    def parse_colon_separated_string_to_dict(self, input_str: str, parse_int: bool = False):
        output_dict = {}
        pairs = input_str.split(", ")
        for pair in pairs:
            if ":" in pair:
                key, value = pair.split(":", 1)
                key = key.strip()
                value = value.strip()
                if parse_int:
                    try:
                        clean_value = value.replace("$", "").replace(",", "")
                        value = int(clean_value)
                    except ValueError:
                        value = None
                output_dict[key] = value
        return output_dict

    # --- Helper to parse multiple tool lines from a chunk
    def parse_tools_to_dict(self, input_text):
        chunks = input_text.split("), ")
        tool_dict = {}
        for chunk in chunks:
            if not chunk.endswith(")"):
                chunk += ")"
            if ":" in chunk:
                parts = chunk.split(":", 1)
                tool_name = parts[0].strip()
                description = parts[1].strip() if len(parts) > 1 else ""
                tool_dict[tool_name] = description
        return tool_dict

    def generateResponse(self):
        # 1) Build the final user prompt
        merged_prompt = (
            f"My location is {self.user_info['Location']}. "
            f"My budget is {self.user_info['Budget']}. "
            f"My tools are {self.toolstack}. "
            f"My crops are {self.user_info['Crops']}. "
            f"The total area I am working with is {self.total_area}. "
            f"The description of my soil is: {self.soil}. "
            "Given this scenario, break down the entire tillage project into a day-by-day schedule, "
            "indicating which tool(s) are used on each day. You must handle each step required "
            "for successful tillage, from initial passes (like heavy tillage or ripping) to final "
            "seedbed prep, factoring in the soil's heavy clay and drainage issues. "
            "For each day, choose the best tool(s) based on cost, soil condition, and the budget. "
            "If multiple tools are needed, show them in a logical order (Day 1: Tool A, Day 2: Tool B, etc.). "
            "Also note that the same tool can be used on multiple days."
            "Be sure to respect my total budget. Tools or combos exceeding my budget should be marked over budget "
            "and NOT used, or specifically justified if no other option is possible. "
            "Ensure that your schedule is atleast 3 to 5 days long. Also, give a rough estimate of the area covered."
            f"REMEMBER, the total area of all days MUST ADD UP TO {self.total_area}. This is extremely extremely extremely important to know. "
            "Also, please note, the estimated costs of the day as well as the estimated profits of the day should be given. You can find the "
            "estimated costs of the day in the toolstack json data and you are already aware of the estimated profit of the day."
            "Ensure you reference the soils (Reddick clay loam, Andres silt loam, Ashkum silty clay loam) in your explanation "
            "of why each tool is selected. Your final output should be structured as follows:\n\n"
            "Schedule:\n"
            "Day 1: tool_name(s), area_covered, estimated costs of the day, estimated profits of the day\n"
            "Day 2: tool_name(s), area_covered, estimated costs of the day, estimated profits of the day\n"
            "Day 3: tool_name(s), area_covered, estimated costs of the day, estimated profits of the day\n"
            "...\n\n"
            "Then, after the schedule, provide the final recommended tool for the entire project "
            "and a short explanation of why it’s considered best overall (highest profit within budget). "
            "Follow that with the EXACT format below for the overall profits, explanations, and external tool:\n\n"
            "Profits: tool1_name: estimated_profit, tool2_name: estimated_profit, ...\n"
            "Explanations: tool1_name: explanation (over or under budget), tool2_name: explanation, ...\n"
            "External Tool: tool_name: tool_cost, predicted_profit, weekly_profit_rate\n"
            "External Explanation: Why the tool is efficient for the situation we are in."
        )
        self.message_history.append({"role": "user", "content": merged_prompt})

        # 2) Call AzureOpenAI
        azure_client = AzureOpenAI(
            api_key=self.AZURE_OPENAI_API_KEY,
            azure_endpoint=self.AZURE_OPENAI_ENDPOINT,
            api_version=self.AZURE_API_VERSION
        )
        response = azure_client.chat.completions.create(
            model=self.model_deployment,
            messages=self.message_history,
            temperature=0
        )
        reply_content = response.choices[0].message.content

        try:
            # 3) Parse the "Schedule:" text separately
            self.schedule_text = reply_content.split("Schedule:")[1].split("Profits:")[0].strip()

            # 4) Parse profits, explanations, external tool, external explanation
            profits_part = reply_content.split("Profits:")[1].split("Explanations:")[0].strip()
            self.explanations_part = reply_content.split("Explanations:")[1].split("External Tool:")[0].strip()
            external_tool_dic = reply_content.split("External Tool: ")[1].split("External Explanation:")[0].strip()
            self.external_tool_expl = "External Tool:" + reply_content.split("External Explanation:")[1].strip()

            # 5) Convert the "Profits" section to a dict of {tool_name: profit}
            self.profitDict = self.parse_colon_separated_string_to_dict(profits_part)

            # 6) Convert the "External Tool" line to a dict as well
            self.externDict = self.parse_colon_separated_string_to_dict(external_tool_dic)

            # 7) Clean numeric values in self.profitDict
            for key in self.profitDict:
                try:
                    number = int(re.sub(r"[^\d]", "", self.profitDict[key]))
                    self.profitDict[key] = number
                except:
                    pass

            # 8) Clean numeric values in self.externDict
            for val in self.externDict:
                try:
                    number = int(re.sub(r"[^\d]", "", self.externDict[val]))
                    self.externDict[val] = number
                except:
                    pass

            # 9) Build a final result to display or return
            result = [
                f"Schedule:\n{self.schedule_text}\n", 
                f"Profits Dict: {self.profitDict}", 
                f"Explanations: {self.explanations_part}",
                f"External Tool: {self.externDict}",
                self.external_tool_expl
            ]

        except Exception:
            # If the format wasn't as expected
            result = [reply_content]

        return result

    # Accessors
    def getSchedule(self):
        return self.schedule_text

    def getTools(self):
        return self.profitDict

    def getExplanations(self):
        return self.parse_tools_to_dict(self.explanations_part)
    
    def getExternalTools(self):
        return self.externDict
    
    def getExternalExplanation(self):
        return self.external_tool_expl

# --------------------
# Example Usage
# --------------------
if __name__ == "__main__":
    chatbot = Chatbot("Illinois", 1000, "Corn")
    final_answer = chatbot.generateResponse()

    print("\n--- Final Recommendation ---\n")
    for part in final_answer:
        print(part, "\n")

    # # If you need the final schedule, profits, etc. individually:
    # print("\n--- SCHEDULE ---\n", chatbot.getSchedule())
    # print("\n--- PROFITS DICT ---\n", chatbot.getTools())
    # print("\n--- EXPLANATIONS DICT ---\n", chatbot.getExplanations())
    # print("\n--- EXTERNAL TOOL DICT ---\n", chatbot.getExternalTools())
    # print("\n--- EXTERNAL TOOL EXPLANATION ---\n", chatbot.getExternalExplanation())
