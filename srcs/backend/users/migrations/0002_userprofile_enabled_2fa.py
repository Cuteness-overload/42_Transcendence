# Generated by Django 3.2.25 on 2024-11-27 09:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='enabled_2fa',
            field=models.BooleanField(default=False),
        ),
    ]
