# Generated by Django 5.1.7 on 2025-03-13 22:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='patient',
            name='birth_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]
