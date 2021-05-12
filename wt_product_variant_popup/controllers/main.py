from odoo.addons.website_sale.controllers.main import WebsiteSale
from odoo import http
from odoo.http import request


class WebsiteSale(WebsiteSale):
    @http.route(['/sale/get_list_combination_info'], type='json', auth="public", methods=['POST'], website=True)
    def get_combination_list_info(self, product_template_id, pricelist_id, **kw):
        product_templ_ids = request.env['product.template'].browse(product_template_id)
        pricelist = request.website.get_current_pricelist()
        product_variant_ids = product_templ_ids.product_variant_ids
        datas = []
        values = {}
        for product in product_variant_ids:
            product_datas = {}
            if product.exists():
                combination = product.product_template_attribute_value_ids
                is_combination_possible = product_templ_ids._is_combination_possible(combination=combination, parent_combination=False)
                if is_combination_possible:
                    product_datas = product_templ_ids._get_combination_info(combination, int(product.id or 0), int(1), pricelist)
                    product_datas['is_combination_possible'] = is_combination_possible
                    product_datas['product_att_ids'] = product.product_template_attribute_value_ids.ids
            if product_datas:
                datas.append(product_datas)
        values['varinat_popup'] = request.env['ir.ui.view']._render_template("wt_product_variant_popup.variant_popup", {
            'datas': datas[0:3],
            'website': request.website,
            'pricelist': pricelist
        })
        return values

    def _get_pricelist(self, pricelist_id, pricelist_fallback=False):
        return request.env['product.pricelist'].browse(int(pricelist_id or 0))