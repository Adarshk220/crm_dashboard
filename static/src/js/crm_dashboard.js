/**@odoo-module **/
import { registry } from "@web/core/registry";
import { useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { _t } from "@web/core/l10n/translation";
import { Component, useRef, onWillStart, onMounted } from  "@odoo/owl";
const actionRegistry = registry.category("actions");
import { loadJS } from "@web/core/assets";
class CrmDashboard extends Component {
    setup() {
         super.setup()
         this.orm = useService('orm')
         this.actionService = useService("action");
         this._fetch_data('year')
         this.chartRef = useRef("lost_lead");
         this.doughnutRef = useRef("lead_medium");
         this.linechartRef = useRef("lead_campaign");
         this.pieRef = useRef("lead_activity");
//         this.state = useState({
//            lead_data: []
//         });
        onWillStart(async ()=>{
               await loadJS("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js")
        })
   onMounted(()=>this.renderChart())
   }
   _fetch_data(IntervalValue){
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
        const result = await this.orm.call("crm.lead", "get_tiles_data", [IntervalValue], {});
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
   async _OnClickExpectedRevenue(){
        const IntervalValue = $('#timeInterval').find(":selected").val();
        const result = await this.orm.call("crm.lead", "get_tiles_data", [IntervalValue], {});
        const opportunity_ids = result.opportunity_ids
        console.log(opportunity_ids)
        const action = await this.actionService.doAction({
                name: _t('Expected Revenue'),
                type: 'ir.actions.act_window',
                res_model: 'crm.lead',
                views: [[false, "list"]],
                domain: [['id', 'in', opportunity_ids]],
                target: 'current',
            });
   }
   async _OnClickRevenue(){
        const IntervalValue = $('#timeInterval').find(":selected").val();
        const result = await this.orm.call("crm.lead", "get_tiles_data", [IntervalValue], {});
        const won_opportunity_ids = result.won_opportunity_ids
        console.log(won_opportunity_ids)
        const action = await this.actionService.doAction({
                name: _t('My Revenue'),
                type: 'ir.actions.act_window',
                res_model: 'crm.lead',
                views: [[false, "list"]],
                domain: [['id', 'in', won_opportunity_ids]],
                target: 'current',
            });
   }
   async _OnClickWin(){
        const IntervalValue = $('#timeInterval').find(":selected").val();
        const result = await this.orm.call("crm.lead", "get_tiles_data", [IntervalValue], {});
        const lead_ids = result.lead_ids
        const action = await this.actionService.doAction({
                name: _t('Win Ratio'),
                type: 'ir.actions.act_window',
                res_model: 'crm.lead',
                views: [[false, "list"]],
                domain: [['id', 'in', lead_ids]],
                target: 'current',
            });
   }
   renderChart(){
        this.lost_lead_graph();
        this.lead_medium_doughnut();
        this.lead_campaign_linechart();
        this.lead_activity_pie();
       }
       async lost_lead_graph(){
        const IntervalValue = $('#timeInterval').find(":selected").val();
        const data = await this.orm.call("crm.lead", 'get_tiles_data', [IntervalValue], {});

        new Chart(
             this.chartRef.el,
            {
              type: 'bar',
              data: {
                labels: data['lost_reason'],
                datasets: [
                  {
                    label: 'Leads Count',
                    data: data['lost_count']
                  }
                ]
              }
            }
        );
       }
       async lead_medium_doughnut(){
        const IntervalValue = $('#timeInterval').find(":selected").val();
        const data = await this.orm.call("crm.lead", 'get_tiles_data', [IntervalValue], {});

        new Chart(
             this.doughnutRef.el,
            {
              type: "doughnut",
              data: {
                    labels: data['lead_medium'],
                    datasets: [{
                        backgroundColor: "black",
                        data: data['lead_medium_count']
                    }]
              },
              options: {
              }
            });
       }
       async lead_campaign_linechart(){
        const IntervalValue = $('#timeInterval').find(":selected").val();
        const data = await this.orm.call("crm.lead", 'get_tiles_data', [IntervalValue], {});

        new Chart(
             this.linechartRef.el,
            {
                type: "line",
                data: {
                    labels: data['lead_campaign'],
                    datasets: [{
                        label: 'Leads Count',
                        data: data['lead_campaign_count'],
                        pointBackgroundColor: "black",
                    }]
                },
                option: {}
            });
        }
        async lead_activity_pie(){
        const IntervalValue = $('#timeInterval').find(":selected").val();
        const data = await this.orm.call("crm.lead", 'get_tiles_data', [IntervalValue], {});

        new Chart(
             this.pieRef.el,
            {
                type: "pie",
                data: {
                    labels: data['lead_activity'],
                    datasets: [{
                        label: 'Leads Count',
                        data: data['lead_activity_count'],
                    }]
                },
                option: {}
            });
        }
        render_warehouse_location(){
    this.orm.call("stock.picking", "display_location_warehouse", [{}]
    ).then((result) => {
        this.state.warehouse_data = result['warehouse']
        this.state.location_data = result['location']
    });
}
//        const time_interval = $('#timeIntervalDropdown').find(":selected").val()
}
CrmDashboard.template = "crm.CrmDashboard";
actionRegistry.add("crm_dashboard_tag", CrmDashboard);