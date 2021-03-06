# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf import settings
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponse

import csv
import json
import psycopg2
import psycopg2.extras as pg_extras

from .models import UserLabel


@login_required(login_url='/login/')
def home(request):
    user = request.user
    if user.is_staff:
        return render(request, "index.html", {})

    user_label = UserLabel.objects.filter(user=user).first()
    if (user_label and not user_label.isActive) or not user_label:
        return render(request, 'not_permitted.html', {})

    return render(request, "index.html", {})


# @login_required(login_url='/login/')
def user_data(request):
    user = request.user
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = \
        'attachment; filename="somefilename.csv"'

    if user.is_authenticated():
        user_label = UserLabel.objects.filter(user=user).first()
        if user.is_staff:
            # TODO: is not used currently due to difficulty of dc
            # rendering rows above 200K. Once fixed, use label = -1
            label = user_label.label
        else:
            label = user_label.label
        response_data = get_data_for_user(label)
        if response_data:
            writer = csv.DictWriter(response, response_data[0].keys())
            writer.writeheader()
            for rs in response_data:
                writer.writerow(rs)
    return response


def get_data_for_user(user_label_):
    """
    :param user_label_: <integer>
        Note: to retrieve all rows from the univers_tbl, use 'user_label_= -1'
    :return rs: <dict> Result set
    """
    customer_tbl = 'customer_test'
    universe_tbl = 'univers_20160702'

    if user_label_ == -1:  # admin/staff, retrieve all rows
        # TODO: is not used currently due to difficulty of dc rendering rows
        # above 200K.
        qry = """
            SELECT kon, alder, inkomstklass, fbf_postort, fbf_lankod
            FROM {universe_tbl}
            LIMIT 200000
            ;
            """.format(universe_tbl=universe_tbl)
    else:
        # TODO: choose only required fields.
        qry = """
            SELECT u.*
            FROM {customer_tbl} c
            INNER JOIN {universe_tbl} u
            ON c.uni =  u.uni
            WHERE c.label like '{user_label}'
            ;
            """.format(
            customer_tbl=customer_tbl,
            universe_tbl=universe_tbl,
            user_label=str(user_label_)
        )

    conn = connect()
    rs = []
    try:
        cur = conn.cursor(cursor_factory=pg_extras.RealDictCursor)
        cur.execute(qry)
    except Exception as e:
        print '*' * 60
        print e
        conn.rollback()
    else:
        rs = cur.fetchall()
    return rs


def connect():
    try:
        conn = psycopg2.connect(**settings.PG_DB_PARAMS)
    except:
        conn.rollback()
    finally:
        return conn


def tmp():
    tmp = """
    SELECT table_name
      FROM information_schema.tables
     WHERE table_schema='public'
       AND table_type='BASE TABLE';
    """

    XX = [('univers_20161105',),
     ('univers_20170401',),
     ('latest_table',),
     ('univers_20160702',),
     ('test',),
     ('test2',),
     ('univers_20170603',),
     ('test_table',),
     ('customer_test',)]
