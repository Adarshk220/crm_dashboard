# -*- coding: utf-8 -*-

from odoo import fields, models


class CrmTeam(models.Model):
    """Model for adding of CRM stage field in CRM team model"""
    _inherit = "crm.team"

    crm_lead_state_id = fields.Many2one("crm.stage", string="CRM Lead State")
