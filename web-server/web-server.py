#!/usr/bin/python3

from flask import Flask, request, send_file

import urllib.request, json, os, sys, tempfile, bcrypt

os.chdir(os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__)

@app.route("/api/home")
def home():
    with open('data/applist.json') as applist_file:
        applist = json.load(applist_file)
        data = { 'featured_apps': applist['featured_apps'], 'latest_apps': [] }
        for app in list(applist['apps'])[-20:]:
            applist['apps'][app]['id'] = app
            del applist['apps'][app]['pwd']
            data['latest_apps'].insert(0, applist['apps'][app])
        return data

@app.route("/api/appview")
def appview():
    with open('data/applist.json') as applist_file:
        applist = json.load(applist_file)
        return { 'app': applist['apps'][str(request.args['id'])] }

@app.route("/api/search")
def search():
    with open('data/applist.json') as applist_file:
        data = { 'results': [] }

        if len(request.args['name']) < 3:
            return data

        not_so_relevant = []
        applist = json.load(applist_file)
        for app in applist['apps']:
            app_id = app
            app = applist['apps'][app]
            del app['pwd']
            app['id'] = app_id
            if ''.join(app['name'].split()).lower().find(''.join(request.args['name'].split()).lower()) != -1:
                if ''.join(app['name'].split()).lower().startswith(''.join(request.args['name'].split()).lower()):
                    data['results'].append(app)
                else:
                    not_so_relevant.append(app)
        data['results'] += not_so_relevant
        return data

@app.route("/api/publish", methods = ['POST'])
def publish():
    with open('data/applist.json', 'r+') as applist_file:
        applist = json.load(applist_file)
        app_id = len(applist['apps']) + 1
        new_app = {
            'name': request.form['name'],
            'website': request.form['website'],
            'logo': request.form['logo'],
            'pointer': request.form['pointer'],
            'summary': request.form['summary'],
            'category': request.form['category'],
            'accent': request.form['accent'],
            'pwd': request.form['pwd'],
        }

        if request.form['deb_pkg_name'] != '':
            new_app['deb_pkg_name'] = request.form['deb_pkg_name']

        applist['apps'][app_id] = new_app
        applist_file.seek(0)
        json.dump(applist, applist_file, indent=4)
        applist_file.truncate()
        return { 'success': 'yes', 'id': app_id }

@app.route("/api/delete_app", methods = ['POST'])
def delete():
    with open('data/applist.json', 'r+') as applist_file:
        applist = json.load(applist_file)
        if bcrypt.checkpw(request.form['pwd'].encode('utf8'), applist['apps'][request.form['id']]['pwd'].encode('utf8')):
            del applist['apps'][str(request.form['id'])]
            applist_file.seek(0)
            json.dump(applist, applist_file, indent=4)
            applist_file.truncate()
            return { 'success': 'yes' }
        else:
            return { 'success': 'no' }

def direct_delete(id):
    with open('data/applist.json', 'r+') as applist_file:
        applist = json.load(applist_file)
        del applist['apps'][id]
        applist_file.seek(0)
        json.dump(applist, applist_file, indent=4)
        applist_file.truncate()

if __name__ == "__main__" and sys.argv[1] == "start":
    app.run(debug=False, port=2200, host='0.0.0.0')
elif sys.argv[1] == "direct_delete" and sys.argv[2] is not None:
    direct_delete(sys.argv[2])