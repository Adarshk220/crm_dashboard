from dateutil.relativedelta import relativedelta, SU, MO

from odoo import api, models, fields


class CrmLead(models.Model):
    """Model for inheritance in crm leads"""
    _inherit = "crm.lead"

    @api.model
    def get_tiles_data(self, IntervalValue):
        """ Returns the tile data"""
        today = fields.date.today()
        week_start_day = today + relativedelta(weekday=MO(-1))
        month_start_day = today + relativedelta(day=1)
        year_start_day = today + relativedelta(day=1, month=1)
        quarter_start_day = today + relativedelta(months=-2)
        print(week_start_day, today, year_start_day, month_start_day, quarter_start_day)
        if IntervalValue == 'year':
            start_date = year_start_day
        elif IntervalValue == 'quarter':
            start_date = quarter_start_day
        elif IntervalValue == 'month':
            start_date = month_start_day
        else:
            start_date = week_start_day
        company_id = self.env.company
        leads = self.search([('company_id', '=', company_id.id),
                             ('user_id', '=', self.env.user.id),
                             ('create_date', '>=', start_date)])
        my_leads = leads.filtered(lambda r: r.type == 'lead')
        my_opportunity = leads.filtered(lambda r: r.type == 'opportunity')
        currency = company_id.currency_id.symbol
        expected_revenue = sum(my_opportunity.mapped('expected_revenue'))
        won_opportunity = my_opportunity.filtered(lambda r: r.stage_id.id == 4)
        lost_opportunity = leads.search([('active', '=', False), ('probability', '=', 0)]).mapped('name')
        win_ratio = (len(won_opportunity) / len(lost_opportunity)) * 100
        revenue = sum(won_opportunity.mapped('expected_revenue'))
        print(my_leads,
              my_opportunity)
        return {
            'total_leads': len(my_leads),
            'lead_ids': my_leads.ids,
            'total_opportunity': len(my_opportunity),
            'opportunity_ids': my_opportunity.ids,
            'expected_revenue': expected_revenue,
            'currency': currency,
            'revenue': revenue,
            'win_ratio': win_ratio,
        }
