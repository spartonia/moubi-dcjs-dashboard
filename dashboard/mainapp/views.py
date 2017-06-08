# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf import settings
from django.shortcuts import render
from django.contrib.auth.decorators import login_required

import psycopg2
import psycopg2.extras as pg_extras

from .models import UserLabel


@login_required(login_url='/login/')
def home(request):
    user = request.user
    user_label = UserLabel.objects.filter(user=user).first()
    if (user_label and not user_label.isActive) or not user_label:
        return render(request, 'not_permitted.html', {})

    user_label_ = user_label.label
    rs = get_data_for_user(user_label_)
    # import ipdb; ipdb.set_trace()

    return render(request, "index.html", {})


def get_data_for_user(user_label_):
    qry = """
        SELECT u.*
        FROM {customer_tbl} c
        INNER JOIN {universe_tbl} u
        ON c.uni =  u.uni
        WHERE c.label like '{user_label}';
        """.format(
        customer_tbl='customer_test',
        universe_tbl='univers_20160702',
        user_label=str(user_label_)
    )

    conn = conncet()
    try:
        cur = conn.cursor(cursor_factory=pg_extras.RealDictCursor)
        cur.execute(qry)
    except Exception as e:
        print '*' * 60
        print e
        conn.rollback()
    finally:
        rs = cur.fetchall()
        return rs


def conncet():
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
