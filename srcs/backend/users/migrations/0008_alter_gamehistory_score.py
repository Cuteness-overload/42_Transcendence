# Generated by Django 3.2.25 on 2024-12-04 16:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0007_userprofile_friends'),
    ]

    operations = [
        migrations.AlterField(
            model_name='gamehistory',
            name='score',
            field=models.CharField(max_length=5),
        ),
    ]
