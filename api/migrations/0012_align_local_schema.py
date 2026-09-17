from django.db import migrations


def _has_column(cursor, table, column):
    cursor.execute(
        """
        SELECT COUNT(*) FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s AND COLUMN_NAME = %s
        """,
        [table, column],
    )
    return cursor.fetchone()[0] > 0


def _has_table(cursor, table):
    cursor.execute(
        """
        SELECT COUNT(*) FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s
        """,
        [table],
    )
    return cursor.fetchone()[0] > 0


def _has_constraint(cursor, table, name):
    cursor.execute(
        """
        SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
        WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = %s AND CONSTRAINT_NAME = %s
        """,
        [table, name],
    )
    return cursor.fetchone()[0] > 0


def forwards(apps, schema_editor):
    with schema_editor.connection.cursor() as cursor:
        if not _has_column(cursor, 'cookbook', 'creator_id'):
            cursor.execute('ALTER TABLE cookbook ADD COLUMN creator_id int DEFAULT NULL')

        if not _has_table(cursor, 'subscribed_cookbook'):
            cursor.execute(
                """
                CREATE TABLE subscribed_cookbook (
                  user_id int NOT NULL,
                  cb_id int NOT NULL,
                  PRIMARY KEY (user_id, cb_id)
                )
                """
            )

        if _has_constraint(cursor, 'review', 'review_ibfk_1'):
            cursor.execute('ALTER TABLE review DROP FOREIGN KEY review_ibfk_1')

        cursor.execute(
            """
            INSERT INTO category (r_type, r_region)
            SELECT 'Japanese', 'Asia' FROM DUAL
            WHERE NOT EXISTS (
                SELECT 1 FROM category WHERE r_type = 'Japanese' AND r_region = 'Asia'
            )
            """
        )
        cursor.execute(
            """
            INSERT INTO category (r_type, r_region)
            SELECT 'Korean', 'Asia' FROM DUAL
            WHERE NOT EXISTS (
                SELECT 1 FROM category WHERE r_type = 'Korean' AND r_region = 'Asia'
            )
            """
        )
        cursor.execute(
            """
            INSERT INTO identified_by (ib_r_id, ib_c_id)
            SELECT 1, category_id FROM category
            WHERE r_type = 'Japanese' AND r_region = 'Asia'
              AND EXISTS (SELECT 1 FROM recipe WHERE recipe_id = 1)
              AND NOT EXISTS (
                  SELECT 1 FROM identified_by ib
                  JOIN category c ON c.category_id = ib.ib_c_id
                  WHERE ib.ib_r_id = 1 AND c.r_type = 'Japanese'
              )
            """
        )
        cursor.execute(
            """
            INSERT INTO identified_by (ib_r_id, ib_c_id)
            SELECT 2, category_id FROM category
            WHERE r_type = 'Korean' AND r_region = 'Asia'
              AND EXISTS (SELECT 1 FROM recipe WHERE recipe_id = 2)
              AND NOT EXISTS (
                  SELECT 1 FROM identified_by ib
                  JOIN category c ON c.category_id = ib.ib_c_id
                  WHERE ib.ib_r_id = 2 AND c.r_type = 'Korean'
              )
            """
        )


def backwards(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_subscribedcookbook_admin_admin'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
