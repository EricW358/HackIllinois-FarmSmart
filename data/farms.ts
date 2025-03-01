export const PREDEFINED_FARMS = {
  "Illinois State Farm": {
    location: "Illinois",
    soilDescription:
      "Your soil is predominantly clay-heavy, poorly drained, and prone to ponding, requiring careful tillage to improve water movement and prevent compaction. The majority (74.2%) of your land is Reddick clay loam (594A), which holds water for long periods due to its high clay content and slow infiltration rate (0.06 to 0.20 in/hr). The water table is extremely shallow (0 to 12 inches), leading to frequent ponding. However, it retains a high amount of moisture (~9.1 inches in the top 60 inches), which is beneficial in dry conditions. It is prime farmland only if properly drained, making drainage and aeration a top priority for tillage. Andres silt loam (293A) covers 18.8% of your land and is somewhat poorly drained, but more workable than the Reddick clay. It has a slightly deeper water table (12 to 24 inches), better drainage, and is classified as prime farmland. However, its low infiltration rate still makes it vulnerable to waterlogging if improperly managed. The smallest section (7%) is Ashkum silty clay loam (232A), another poorly drained soil with frequent ponding and a very shallow water table (0 to 12 inches). It compacts easily and stays wet for long periods, though it has moderate water-holding capacity (~8.1 inches in the top 60 inches). Like the Reddick soil, it is prime farmland only if drained properly. Overall, your soil is highly compactable and holds water too well, creating drainage issues. Tillage should focus on reducing compaction, improving drainage, and maintaining soil structure. Deep tillage or strip tillage would be more effective than aggressive plowing, which could worsen compaction. While your soil is naturally fertile, managing water retention and aeration is crucial for crop success.",
    tillageOptions: [
      {
        name: "No-Till Planting (Farmer Owned)",
        type: "16-row No-Till Planter",
        working_speed_mph: 5,
        soil_type: "Silty Clay Loam",
        width_ft: 30,
        operating_cost_per_acre: 55,
        total_cost: 847,
      },
      {
        name: "High-Speed Disk (Farmer Owned - Secondary Tillage/Seedbed Prep)",
        type: "High-Speed Disk (e.g., Salford Halo or similar)",
        working_speed_mph: 8,
        soil_type: "Silty Clay Loam",
        width_ft: 30,
        operating_cost_per_acre: 50,
        total_cost: 770,
      },
      {
        name: "Conventional Disk Harrow (Farmer Owned - Secondary Tillage)",
        type: "Large Tandem Disc Harrow",
        working_speed_mph: 6,
        soil_type: "Silty Clay Loam",
        width_ft: 35,
        operating_cost_per_acre: 60,
        total_cost: 924,
      },
      {
        name: "Co-op Hired Resource: Custom Deep Rip with Cover Crop Seeding",
        hired_resource: "Commercial Deep Rip and Cover Crop Service",
        cost_per_acre: 75,
        tillage_mechanism: "Deep Ripper with Cover Crop Seeder Attachment",
        estimated_time_hours_per_acre: 0.4,
        total_cost: 1155,
      },
      {
        name: "Co-op Hired Resource: Custom Moldboard Plowing",
        hired_resource: "Commercial Moldboard Plowing Service",
        cost_per_acre: 90,
        tillage_mechanism: "Large Moldboard Plow",
        estimated_time_hours_per_acre: 0.5,
        total_cost: 1386,
      },
    ],
  },
  "North Dakota State Farm": {
    location: "North Dakota",
    soilDescription: "", // Add the soil description for ND when available
    tillageOptions: [
      {
        name: "No-Till Planting (Farmer Owned)",
        type: "Air Drill No-Till Planter",
        working_speed_mph: 4.5,
        soil_type: "Silt Loam",
        width_ft: 40,
        operating_cost_per_acre: 47.5,
      },
      {
        name: "Air Seeder with Disc Coulters (Farmer Owned - for Wheat/Small Grains)",
        type: "Air Seeder with Independent Disc Coulters (minimal tillage seeding)",
        working_speed_mph: 5,
        soil_type: "Silt Loam",
        width_ft: 50,
        operating_cost_per_acre: 39,
      },
      {
        name: "Vertical Tillage (Farmer Owned - Light Residue Management)",
        type: "Light Vertical Tillage Tool (e.g., Sunflower or Landoll type)",
        working_speed_mph: 6,
        soil_type: "Silt Loam",
        width_ft: 35,
        operating_cost_per_acre: 42.5,
      },
      {
        name: "Co-op Hired Resource: Custom Strip-Till Application",
        hired_resource: "Commercial Strip-Till Service",
        cost_per_acre: 55,
        tillage_mechanism: "Strip-Till Implement (8-row or 12-row unit)",
        estimated_time_hours_per_acre: 0.2,
      },
      {
        name: "Co-op Hired Resource: Custom Heavy Discing",
        hired_resource: "Commercial Heavy Discing Service",
        cost_per_acre: 50,
        tillage_mechanism:
          "Large Offset Disc Harrow (aggressive residue incorporation)",
        estimated_time_hours_per_acre: 0.3,
      },
    ],
  },
};
