-- Create conversations table
create table conversations (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    title text,
    messages jsonb[] not null default '{}',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    is_archived boolean default false not null
);

-- Enable RLS (Row Level Security)
alter table conversations enable row level security;

-- Create policy to allow users to read their own conversations
create policy "Users can read their own conversations"
    on conversations for select
    using (auth.uid() = user_id);

-- Create policy to allow users to insert their own conversations
create policy "Users can create their own conversations"
    on conversations for insert
    with check (auth.uid() = user_id);

-- Create policy to allow users to update their own conversations
create policy "Users can update their own conversations"
    on conversations for update
    using (auth.uid() = user_id);

-- Create policy to allow users to delete their own conversations
create policy "Users can delete their own conversations"
    on conversations for delete
    using (auth.uid() = user_id);

-- Create index for faster queries
create index conversations_user_id_idx on conversations(user_id);
create index conversations_created_at_idx on conversations(created_at);

-- Function to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger conversations_updated_at
    before update on conversations
    for each row
    execute function update_updated_at_column(); 