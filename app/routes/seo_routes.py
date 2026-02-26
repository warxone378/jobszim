from flask import Blueprint, Response, request
from app.models import job_model
from app.models.user import User
import xml.etree.ElementTree as ET
from datetime import datetime

seo_bp = Blueprint('seo', __name__)

@seo_bp.route('/sitemap.xml')
def sitemap():
    urlset = ET.Element('urlset', xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    base_url = request.url_root.rstrip('/')

    # Static pages
    static_pages = [
        '', 'login.html', 'register.html', 'about.html',
        'contact.html', 'privacy.html', 'profile.html',
        'saved.html', 'alerts.html', 'chat.html', 'employer-dashboard.html'
    ]
    for page in static_pages:
        url = ET.SubElement(urlset, 'url')
        loc = ET.SubElement(url, 'loc')
        loc.text = f"{base_url}/{page}"
        changefreq = ET.SubElement(url, 'changefreq')
        changefreq.text = 'monthly'
        priority = ET.SubElement(url, 'priority')
        priority.text = '0.5'

    # Job detail pages (only approved jobs)
    jobs = job_model.get_all_jobs()
    for job in jobs:
        if job.get('status') == 'approved':
            url = ET.SubElement(urlset, 'url')
            loc = ET.SubElement(url, 'loc')
            loc.text = f"{base_url}/job/{job['id']}"
            lastmod = ET.SubElement(url, 'lastmod')
            lastmod.text = job.get('updated', job.get('posted', datetime.utcnow().date().isoformat()))
            changefreq = ET.SubElement(url, 'changefreq')
            changefreq.text = 'weekly'
            priority = ET.SubElement(url, 'priority')
            priority.text = '0.8'

    # Company pages (users with company profiles)
    users = User.query.all()
    for user in users:
        if user.company_name:
            url = ET.SubElement(urlset, 'url')
            loc = ET.SubElement(url, 'loc')
            loc.text = f"{base_url}/company.html?id={user.id}"
            changefreq = ET.SubElement(url, 'changefreq')
            changefreq.text = 'weekly'
            priority = ET.SubElement(url, 'priority')
            priority.text = '0.6'

    xml_str = ET.tostring(urlset, encoding='unicode')
    return Response(xml_str, mimetype='application/xml')

@seo_bp.route('/robots.txt')
def robots():
    base_url = request.url_root.rstrip('/')
    robots_txt = f"""User-agent: *
Allow: /
Disallow: /admin/
Disallow: /profile/
Disallow: /edit-company/
Sitemap: {base_url}/sitemap.xml
"""
    return Response(robots_txt, mimetype='text/plain')
