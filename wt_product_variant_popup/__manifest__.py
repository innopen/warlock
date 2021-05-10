# -*- coding: utf-8 -*-
# Part of Odoo. See COPYRIGHT & LICENSE files for full copyright and licensing details.

{
    "name": "wt_product_variant_popup",
    "version": "1.0",
    "category": "website",
    "summary": "website ",
    "description": """
        Allow best available attribute Selection.
    """,
    "author": "Warlock Technologies Pvt Ltd.",
    "website": "http://warlocktechnologies.com",
    "support": "info@warlocktechnologies.com",
    "depends": ['base', 'sale', 'website_sale'],
    "data": [
        'security/ir.model.access.csv',
        "views/assets.xml",
        "views/template.xml",
    ],
    "images": [],
    "license": "OPL-1",
    "installable": True,
}
