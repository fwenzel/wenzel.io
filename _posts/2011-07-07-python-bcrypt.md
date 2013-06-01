---
layout: post
title: python-bcrypt
excerpt: A pure-python implementation of bcrypt.
code: https://github.com/fwenzel/python-bcrypt
---

[bcrypt](http://en.wikipedia.org/wiki/Bcrypt) is a key derivation function (hashing function) for passwords.

There is a [reference implementation](http://bcrypt.sourceforge.net/) of bcrypt, written in C. [py-bcrypt](https://pypi.python.org/pypi/py-bcrypt/), the library commonly used to employ bcrypt in Python, is a thin wrapper around this C library. I wanted to see if I can implement this library purely in Python.

Therefore, **python-bcrypt** is an implementation of bcrypt written purely in Python.

### Interesting challenges
#### Compatibility
I implemented python-bcrypt by working off the [original conference paper](http://static.usenix.org/events/usenix99/provos/provos_html/node1.html) describing the algorithm. The result worked largely as expected, but given the same input, it would generate *different hashes* than the C reference implementation. By debugging the C and Python version in parallel (using [gdb](http://en.wikipedia.org/wiki/GNU_Debugger) and [pdb](http://docs.python.org/2/library/pdb.html), respectively), I discovered [discrepancies](https://github.com/fwenzel/python-bcrypt/blob/6a7fb96/bcrypt/bcrypt.py#L98) between the paper and the C implementation that I had to reproduce in order to achieve parity with the reference implementation.

Once I adopted these bugs in my code as well, the hashes produced matched.

#### Performance
The bcrypt algorithm was specifically designed to be CPU-bound and sequential (i.e., not parallelizable). In CPU-bound applications like this, CPython tends to be easily an order of magnitude slower than C, a limitation that's not easily overcome with an algorithm that was *built to be slow*. However, due to the many loops used by the algorithm, a fast JIT (such as [pypy](http://pypy.org/)) can significantly speed up the code's execution.

In my tests at the time, CPython ran about a factor 10 slower than the C version, while pypy ran my library about a factor 3 slower than C.
