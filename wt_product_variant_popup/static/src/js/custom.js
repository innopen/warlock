odoo.define('wt_product_variant_popup.customer', function (require) {
'use strict';

var core = require('web.core');
var publicWidget = require('web.public.widget');
var Dialog = require('web.Dialog');
var _t = core._t;
var WebsiteSale = require('website_sale.website_sale');
// publicWidget.registry.WebsiteSale.include({
//     events: _.extend({}, publicWidget.registry.WebsiteSale.prototype.events, {
//         'click .add_to_cart_json_cl': 'add_to_cart_customer',
//     }),
//     add_to_cart_customer:function(ev){
        
//     },
// });

// var VariantMixin = require('sale.VariantMixin');


publicWidget.registry.WebsiteSale.include({
	events: _.extend({}, publicWidget.registry.WebsiteSale.prototype.events || {}, {
		"change input[name='varinat_selection']": 'change_varinat_popup'
	}),
	async get_combination_list_info(productTemplateId){
		var self = this;
		this._rpc({
			route: "/sale/get_list_combination_info",
            params: {
            	'product_template_id': productTemplateId,
            	'pricelist_id': this.pricelistId || false
            }
		}).then(function (data) {
			$('.selection_confirm_popup').html(data.varinat_popup);
			$('.selection_confirm_popup .modal').modal('show');
			$('.selection_confirm_popup .save_change_varinat_popup').click(function(ev){
				$('.selection_confirm_popup .modal').modal('hide');
				self.change_varinat_popup(ev);
			});
            $('.selection_confirm_popup .save_changes_close').click(function(ev){
                $('.selection_confirm_popup .modal').modal('hide');
                self.change_varinat_popup(ev);
            });
		});
	},
	change_varinat_popup: function(ev){
		var self = this;
		var $el = $(".selection_confirm_popup .modal input[name='varinat_selection']:checked");
		var product_id = parseInt($el.val(), 10);
		var product_attibutes = $el.data('combination_ids');
		history.replaceState(undefined, undefined, '#attr=' + product_attibutes.join(','));
		self._applyHashFromSearch();
		self.triggerVariantChange(self.$el);
	},
	_onChangeCombination: function (ev, $parent, combination) {
        var self = this;
        if(combination.is_combination_possible == false){
        	const params = self.get_combination_list_info(combination.product_template_id);	
        }
        
        var $price = $parent.find(".oe_price:first .oe_currency_value");
        var $default_price = $parent.find(".oe_default_price:first .oe_currency_value");
        var $optional_price = $parent.find(".oe_optional:first .oe_currency_value");
        $price.text(self._priceToStr(combination.price));
        $default_price.text(self._priceToStr(combination.list_price));

        var isCombinationPossible = true;
        if (!_.isUndefined(combination.is_combination_possible)) {
            isCombinationPossible = combination.is_combination_possible;
        }
        this._toggleDisable($parent, isCombinationPossible);

        if (combination.has_discounted_price) {
            $default_price
                .closest('.oe_website_sale')
                .addClass("discount");
            $optional_price
                .closest('.oe_optional')
                .removeClass('d-none')
                .css('text-decoration', 'line-through');
            $default_price.parent().removeClass('d-none');
        } else {
            $default_price
                .closest('.oe_website_sale')
                .removeClass("discount");
            $optional_price.closest('.oe_optional').addClass('d-none');
            $default_price.parent().addClass('d-none');
        }

        var rootComponentSelectors = [
            'tr.js_product',
            '.oe_website_sale',
            '.o_product_configurator'
        ];

        // update images only when changing product
        // or when either ids are 'false', meaning dynamic products.
        // Dynamic products don't have images BUT they may have invalid
        // combinations that need to disable the image.
        if (!combination.product_id ||
            !this.last_product_id ||
            combination.product_id !== this.last_product_id) {
            this.last_product_id = combination.product_id;
            self._updateProductImage(
                $parent.closest(rootComponentSelectors.join(', ')),
                combination.display_image,
                combination.product_id,
                combination.product_template_id,
                combination.carousel,
                isCombinationPossible
            );
        }

        $parent
            .find('.product_id')
            .first()
            .val(combination.product_id || 0)
            .trigger('change');

        $parent
            .find('.product_display_name')
            .first()
            .text(combination.display_name);

        $parent
            .find('.js_raw_price')
            .first()
            .text(combination.price)
            .trigger('change');

        this.handleCustomValues($(ev.target));
    },
});

});
