/**@odoo-module **/
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { _t } from "@web/core/l10n/translation";
import { Component } from  "@odoo/owl";
const actionRegistry = registry.category("actions");
class CrmDashboard extends Component {
    setup() {
         super.setup()
         this.orm = useService('orm')
         this.actionService = useService("action");
         this._fetch_data('year')
   }
   _fetch_data(){
      var self = this;
      $('#my_lead').empty();
      $('#my_opportunity').empty();
      $('#expected_revenue').empty();
      $('#revenue').empty();
      $('#win_ratio').empty();
      this.orm.call("crm.lead", "get_tiles_data", [IntervalValue], {}).then(function(result){
               $('#my_lead').append('<span>' + result.total_leads + '</span>');
               $('#my_opportunity').append('<span>' + result.total_opportunity + '</span>');
               $('#expected_revenue').append('<span>' + result.currency + result.expected_revenue + '</span>');
               $('#revenue').append('<span>' + result.currency + result.revenue + '</span>');
               $('#win_ratio').append('<span>' + result.win_ratio + '%' + '</span>');
      });
      console.log(IntervalValue,'hiiihi')
   };
   async _OnClickLeads(){
        const IntervalValue = $('#timeInterval').find(":selected").val();
        console.log(IntervalValue)
        const result = await this.orm.call("crm.lead", "get_tiles_data", [IntervalValue], {});
        const lead_ids = result.lead_ids
        console.log(lead_ids)
        const action = await this.actionService.doAction({
                name: _t('My Leads'),
                type: 'ir.actions.act_window',
                res_model: 'crm.lead',
                views: [[false, "list"]],
                domain: [['id', 'in', lead_ids]],
                target: 'current',
            });
   }
   async _OnClickOpportunities(){
        const IntervalValue = $('#timeInterval').find(":selected").val();
        const result = await this.orm.call("crm.lead", "get_tiles_data", [], {});
        const opportunity_ids = result.opportunity_ids
        console.log(opportunity_ids)
        const action = await this.actionService.doAction({
                name: _t('My Opportunities'),
                type: 'ir.actions.act_window',
                res_model: 'crm.lead',
                views: [[false, "list"]],
                domain: [['id', 'in', opportunity_ids]],
                target: 'current',
            });
   }
}
CrmDashboard.template = "crm.CrmDashboard";
actionRegistry.add("crm_dashboard_tag", CrmDashboard);