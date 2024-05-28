from odoo import fields, models


class CrmTeam(models.Model):
    """Model for inheritance in sales team"""
    _inherit = "crm.team"

    crm_lead_state_id = fields.Many2one("crm.stage", string="CRM Lead State")
