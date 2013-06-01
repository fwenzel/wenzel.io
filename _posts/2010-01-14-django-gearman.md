---
layout: post
title: django-gearman
excerpt: A Gearman interface for Django.
code: https://github.com/fwenzel/django-gearman
---

**django-gearman** is a convenience wrapper for the [Gearman](http://gearman.org/) [Python Bindings](http://github.com/samuel/python-gearman).

With django-gearman, you can code jobs as well as clients in a Django project with minimal overhead in your application. Server connections etc. all take place in django-gearman and don't unnecessarily clog your application code.

django-gearman is being used in a number of production environments. Ironically, after I wrote the interface, my own employer decided to use [Celery](http://www.celeryproject.org/) instead of Gearman, for its more advanced interfaces, so we never deployed this library ourselves. Nonetheless, I am happy it benefits the open source community.
