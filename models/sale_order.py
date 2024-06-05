# -*- coding: utf-8 -*-

from odoo import models


class SalesOrder(models.Model):
    """For overriding action confirm function"""
    _inherit = 'sale.order'

    def action_confirm(self):
        """Moves the related lead/opportunity to the stage set in the sales team model,
        while the quotation is confirmed"""
        res = super().action_confirm()
        self.opportunity_id.stage_id = self.team_id.crm_lead_state_id
        return res
