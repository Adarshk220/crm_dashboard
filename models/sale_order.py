from odoo import models


class SalesOrder(models.Model):
    """Extends sale order for overriding action confirm function"""
    _inherit = 'sale.order'

    def action_confirm(self):
        res = super().action_confirm()
        self.opportunity_id.stage_id = self.team_id.crm_lead_state_id
        return res
