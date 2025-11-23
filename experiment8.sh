#!/bin/bash

# Simple File-Based DBMS
# Database directory
DB_DIR="./database"
DB_FILE="$DB_DIR/records.db"

# Create database directory if it doesn't exist
mkdir -p "$DB_DIR"

# Function to display menu
show_menu() {
    echo "================================"
    echo "   Simple DBMS Menu"
    echo "================================"
    echo "1. Create/Initialize Database"
    echo "2. Insert Record"
    echo "3. View All Records"
    echo "4. Search Record"
    echo "5. Delete Record"
    echo "6. Exit"
    echo "================================"
}

# Function to create/initialize database
create_db() {
    if [ -f "$DB_FILE" ]; then
        read -p "Database already exists. Do you want to recreate it? (y/n): " choice
        if [ "$choice" != "y" ]; then
            echo "Operation cancelled."
            return
        fi
    fi
    
    # Create header
    echo "ID|Name|Email|Phone" > "$DB_FILE"
    echo "Database created successfully!"
    echo "Fields: ID, Name, Email, Phone"
}

# Function to insert record
insert_record() {
    if [ ! -f "$DB_FILE" ]; then
        echo "Error: Database doesn't exist. Please create it first."
        return
    fi
    
    echo "Enter record details:"
    read -p "ID: " id
    read -p "Name: " name
    read -p "Email: " email
    read -p "Phone: " phone
    
    # Check if ID already exists
    if grep -q "^$id|" "$DB_FILE"; then
        echo "Error: Record with ID $id already exists!"
        return
    fi
    
    # Append record
    echo "$id|$name|$email|$phone" >> "$DB_FILE"
    echo "Record inserted successfully!"
}

# Function to view all records
view_records() {
    if [ ! -f "$DB_FILE" ]; then
        echo "Error: Database doesn't exist. Please create it first."
        return
    fi
    
    echo "================================"
    echo "All Records:"
    echo "================================"
    
    # Display records in formatted way
    column -t -s '|' "$DB_FILE"
    
    echo "================================"
    total=$(($(wc -l < "$DB_FILE") - 1))
    echo "Total records: $total"
}

# Function to search record
search_record() {
    if [ ! -f "$DB_FILE" ]; then
        echo "Error: Database doesn't exist. Please create it first."
        return
    fi
    
    echo "Search by:"
    echo "1. ID"
    echo "2. Name"
    echo "3. Email"
    echo "4. Phone"
    read -p "Enter choice (1-4): " search_choice
    
    read -p "Enter search term: " search_term
    
    echo "================================"
    echo "Search Results:"
    echo "================================"
    
    case $search_choice in
        1)
            grep "^$search_term|" "$DB_FILE" | column -t -s '|'
            ;;
        2)
            grep "|$search_term|" "$DB_FILE" | column -t -s '|'
            ;;
        3)
            grep "|.*|$search_term|" "$DB_FILE" | column -t -s '|'
            ;;
        4)
            grep "|$search_term$" "$DB_FILE" | column -t -s '|'
            ;;
        *)
            echo "Invalid choice!"
            return
            ;;
    esac
    
    if [ $? -ne 0 ]; then
        echo "No records found."
    fi
}

# Function to delete record
delete_record() {
    if [ ! -f "$DB_FILE" ]; then
        echo "Error: Database doesn't exist. Please create it first."
        return
    fi
    
    read -p "Enter ID of record to delete: " id
    
    # Check if record exists
    if ! grep -q "^$id|" "$DB_FILE"; then
        echo "Error: No record found with ID $id"
        return
    fi
    
    # Show record to be deleted
    echo "Record to be deleted:"
    grep "^$id|" "$DB_FILE" | column -t -s '|'
    
    read -p "Are you sure you want to delete this record? (y/n): " confirm
    
    if [ "$confirm" = "y" ]; then
        # Delete record (works on both Linux and macOS)
        grep -v "^$id|" "$DB_FILE" > "$DB_FILE.tmp"
        mv "$DB_FILE.tmp" "$DB_FILE"
        echo "Record deleted successfully!"
    else
        echo "Deletion cancelled."
    fi
}

# Main program loop
while true; do
    show_menu
    read -p "Enter your choice (1-6): " choice
    
    case $choice in
        1)
            create_db
            ;;
        2)
            insert_record
            ;;
        3)
            view_records
            ;;
        4)
            search_record
            ;;
        5)
            delete_record
            ;;
        6)
            echo "Exiting... Goodbye!"
            exit 0
            ;;
        *)
            echo "Invalid choice! Please enter a number between 1-6."
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    clear
done