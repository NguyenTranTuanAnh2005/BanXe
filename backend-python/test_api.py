import sqlite3

conn = sqlite3.connect('tuananh_auto.db')
cursor = conn.cursor()

# Update body_type for specific cars
updates = [
    ("Thể thao", "Porsche Taycan 4S"),
    ("Bán tải", "Ford Ranger Wildtrak 2.0L"),
    ("Sedan", "Mercedes-Benz C300 AMG"),
    ("Sedan", "BMW 330i M Sport"),
    ("Sedan", "Toyota Camry 2.5Q"),
]

for body_type, name in updates:
    cursor.execute("UPDATE cars SET body_type = ? WHERE name = ?", (body_type, name))
    print(f"Updated '{name}' -> body_type='{body_type}'")

conn.commit()

# Verify
cursor.execute("SELECT id, name, brand, body_type FROM cars")
print("\n--- All Cars ---")
for row in cursor.fetchall():
    print(f"  {row[0]}. {row[1]} | {row[2]} | {row[3]}")

conn.close()
print("\nDone!")
