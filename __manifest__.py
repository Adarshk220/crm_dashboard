{
    'name': 'CRM Dashboard',
    'author': 'Adarsh',
    'version': '17.0.1.0.0',
    'summary': 'CRM Dashboard',
    'depends': ['base', 'crm', 'sale'],
    'data': [
        'views/crm_client_action_views.xml',
        'views/crm_team_views.xml',
    ],
    'sequence': -101,
    'application': True,
    'assets': {
        'web.assets_backend': [
            'crm_dashboard/static/src/js/crm_dashboard.js',
            'crm_dashboard/static/src/xml/crm_dashboard_template.xml',
        ],
    },
}
