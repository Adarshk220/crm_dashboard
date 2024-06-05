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
         this.fetch = useState({ fetch: ""});
         this.chartRef = useRef("lost_lead");
         this.doughnutRef = useRef("lead_medium");
         this.linechartRef = useRef("lead_campaign");
         this.pieRef = useRef("lead_activity");
         this.state = useState({
            LeadData: [],
         });
        onWillStart(async ()=>{
               await loadJS("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js")
        })
   onMounted(() => {
            this._fetch_data('year');
        });
    }
    async _fetch_data(IntervalValue) {
        this.fetch.fetch = IntervalValue;
        this._updateData(IntervalValue);
        this.lead_by_month_table(IntervalValue);
        await this.renderChart();
    }
   async _updateData(IntervalValue){
      $('#my_lead').empty();
      $('#my_opportunity').empty();
      $('#expected_revenue').empty();
      $('#revenue').empty();
      $('#win_ratio').empty();
      await this.orm.call("crm.lead", "get_tiles_data", [IntervalValue], {}).then(function(result){
               $('#my_lead').append('<span>' + result.total_leads + '</span>');
               $('#my_opportunity').append('<span>' + result.total_opportunity + '</span>');
               $('#expected_revenue').append('<span>' + result.currency + result.expected_revenue + '</span>');
               $('#revenue').append('<span>' + result.currency + result.revenue + '</span>');
               $('#win_ratio').append('<span>' + result.win_ratio + '%' + '</span>');
      });
   };
   async lead_by_month_table(IntervalValue){
            await this.orm.call("crm.lead", "get_tiles_data", [IntervalValue], {}
        ).then((result) => {
            var month_names = result['month_names']
            var leads_by_month_count = result['leads_by_month_count'];
            console.log(result)
            var leadDict = {}
            for (var i = 0; i < month_names.length; i++) {
                var month = month_names[i];
                var count = leads_by_month_count[i];
                leadDict[month] = count;
                }
            this.state.LeadData = leadDict;
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
        var self = this
        let data;
        if (this.fetch.fetch) {
            data = await this.orm.call("crm.lead", 'get_tiles_data', [self.fetch.fetch], {});
        } else {
            data = await this.orm.call("crm.lead", 'get_tiles_data', [{}]);
        }
        if (this.lostGraph){
            this.lostGraph.destroy();
        }

        self.lostGraph = new Chart(
             self.chartRef.el,
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
            });
       }
       async lead_medium_doughnut(){
        var self = this
        let data;
        if (this.fetch.fetch) {
            data = await this.orm.call("crm.lead", 'get_tiles_data', [self.fetch.fetch], {});
        } else {
            data = await this.orm.call("crm.lead", 'get_tiles_data', [{}]);
        }
        if (this.mediumDoughnut){
            this.mediumDoughnut.destroy();
        }

        self.mediumDoughnut = new Chart(
             this.doughnutRef.el,
            {
              type: "doughnut",
              data: {
                    labels: data['lead_medium'],
                    datasets: [{
                        data: data['lead_medium_count']
                    }]
              },
              options: {
              }
            });
       }
       async lead_campaign_linechart(){
        var self = this
        let data;
        if (this.fetch.fetch) {
            data = await this.orm.call("crm.lead", 'get_tiles_data', [self.fetch.fetch], {});
        } else {
            data = await this.orm.call("crm.lead", 'get_tiles_data', [{}]);
        }
        if (this.campaignLinechart){
            this.campaignLinechart.destroy();
        }

        self.campaignLinechart = new Chart(
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
        var self = this
        let data;
        if (this.fetch.fetch) {
            data = await this.orm.call("crm.lead", 'get_tiles_data', [self.fetch.fetch], {});
        } else {
            data = await this.orm.call("crm.lead", 'get_tiles_data', [{}]);
        }
        if (this.activityPie){
            this.activityPie.destroy();
        }

        self.activityPie = new Chart(
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
}
CrmDashboard.template = "crm_dashboard_CrmDashboard";
actionRegistry.add("crm_dashboard_tag", CrmDashboard);