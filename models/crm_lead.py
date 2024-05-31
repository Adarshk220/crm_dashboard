from dateutil.relativedelta import relativedelta, MO

from odoo import api, models, fields


class CrmLead(models.Model):
    """Model for inheritance in crm leads"""
    _inherit = "crm.lead"

    @api.model
    def get_tiles_data(self, intervalvalue):
        """ Returns the tile data"""
        company_id = self.env.company
        user_group = self.env.user.groups_id.filtered(lambda r: r.category_id.name == 'Sales')
        manager = user_group.filtered(lambda r: r.name == 'Administrator')
        today = fields.date.today()
        week_start_day = today + relativedelta(weekday=MO(-1))
        month_start_day = today + relativedelta(day=1)
        year_start_day = today + relativedelta(day=1, month=1)
        quarter_start_day = today + relativedelta(months=-3)
        print(week_start_day, year_start_day, month_start_day, quarter_start_day)
        if intervalvalue == 'year':
            start_date = year_start_day
        elif intervalvalue == 'quarter':
            start_date = quarter_start_day
        elif intervalvalue == 'month':
            start_date = month_start_day
        else:
            start_date = week_start_day
        if manager:
            leads = self.search([('create_date', '>=', start_date)])
        else:
            leads = self.search([('company_id', '=', company_id.id),
                                 ('user_id', '=', self.env.user.id),
                                 ('create_date', '>=', start_date)])
        my_leads = leads.filtered(lambda r: r.type == 'lead')
        my_opportunity = leads.filtered(lambda r: r.type == 'opportunity')
        currency = company_id.currency_id.symbol
        expected_revenue = sum(my_opportunity.mapped('expected_revenue'))
        won_opportunity = my_opportunity.filtered(lambda r: r.stage_id.is_won)
        lost_opportunity = leads.search([('active', '=', False), ('probability', '=', 0)])
        print('lp', lost_opportunity.mapped('lost_reason_id'))
        if len(lost_opportunity) == 0:
            win_ratio = 0
        else:
            win_ratio = (len(won_opportunity) / len(lost_opportunity)) * 100
        revenue = sum(won_opportunity.mapped('expected_revenue'))
        # lost-lead graph data
        lead_lost_count = {}
        for data in lost_opportunity:
            lost_reason = data.lost_reason_id.name
            print('lost_reason', lost_reason,data.name)
            if lost_reason in lead_lost_count:
                lead_lost_count[lost_reason] += 1
            else:
                lead_lost_count[lost_reason] = 1
        lost_reasons_counts = []
        lost_reasons = []
        for lost_reason, count in lead_lost_count.items():
            lost_reasons.append(lost_reason)
            lost_reasons_counts.append(count)
            # lead-medium doughnut data
        lead_medium_count = {}
        for data in leads:
            lead_medium = data.medium_id.name
            print('lost_reason', lead_medium,data.name)
            if lead_medium in lead_medium_count:
                lead_medium_count[lead_medium] += 1
            else:
                lead_medium_count[lead_medium] = 1
        medium_counts = []
        mediums = []
        for medium, medium_count in lead_medium_count.items():
            mediums.append(medium)
            medium_counts.append(medium_count)
            # lead-Campaign Line chart
        lead_campaign_count = {}
        for data in leads:
            lead_campaign = data.campaign_id.title
            print('lost_reason', lead_campaign,data.name)
            if lead_campaign in lead_campaign_count:
                lead_campaign_count[lead_campaign] += 1
            else:
                lead_campaign_count[lead_campaign] = 1
        campaign_counts = []
        campaigns = []
        for campaign, campaign_count in lead_campaign_count.items():
            campaigns.append(campaign)
            campaign_counts.append(campaign_count)
        lead_activity_count = {}
        for data in leads:
            lead_activity = data.activity_ids.activity_type_id.name
            print(lead_activity, data.name)
            if lead_activity in lead_activity_count:
                lead_activity_count[lead_activity] += 1
            else:
                lead_activity_count[lead_activity] = 1
        activity_counts = []
        activities = []
        for activity, activity_count in lead_activity_count.items():
            activities.append(activity)
            activity_counts.append(activity_count)
        return {
            'total_leads': len(my_leads),
            'lead_ids': my_leads.ids,
            'total_opportunity': len(my_opportunity),
            'opportunity_ids': my_opportunity.ids,
            'won_opportunity_ids': won_opportunity.ids,
            'expected_revenue': expected_revenue,
            'currency': currency,
            'revenue': revenue,
            'win_ratio': round(win_ratio, 2),
            'lost_count': lost_reasons_counts,
            'lost_reason': lost_reasons,
            'lead_medium': mediums,
            'lead_medium_count': medium_counts,
            'lead_campaign': campaigns,
            'lead_campaign_count': campaign_counts,
            'lead_activity': activities,
            'lead_activity_count': activity_counts,
        }
    # def get_lost_lead_graph(self):

