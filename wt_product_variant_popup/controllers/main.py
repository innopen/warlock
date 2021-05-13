from odoo.addons.website_sale.controllers.main import WebsiteSale
from odoo import http
from odoo.http import request
import itertools


class WebsiteSale(WebsiteSale):
    @http.route(['/sale/get_list_combination_info'], type='json', auth="public", methods=['POST'], website=True)
    def get_combination_list_info(self, product_template_id, pricelist_id, **kw):
        product_templ_id = request.env['product.template'].browse(product_template_id)
        pricelist = request.website.get_current_pricelist()
        datas = []
        values = {}
        product_datas = {}
        if product_templ_id.exists():
            all_combinations = itertools.product(*[
                ptal.product_template_value_ids._only_active() for ptal in product_templ_id.valid_product_template_attribute_line_ids._without_no_variant_attributes()
            ])
            for combination_tuple in all_combinations:
                combination = request.env['product.template.attribute.value'].concat(*combination_tuple)
                if not combination.filtered(lambda l: l.exclude_for):
                    is_combination_possible = product_templ_id._is_combination_possible_by_config(combination=combination, ignore_no_variant=True,)
                    if is_combination_possible:
                        product_datas = product_templ_id._get_combination_info(combination, int(product_templ_id.id or 0), int(1), pricelist)
                        product_datas['is_combination_possible'] = is_combination_possible
                        product_datas['product_att_ids'] = combination.ids
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