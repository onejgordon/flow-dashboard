#!/usr/bin/python
import optparse
import sys
import unittest
from os.path import dirname, abspath

USAGE = """%prog SDK_PATH TEST_PATH
Run unit tests for App Engine apps.

SDK_PATH    Path to the SDK installation
TEST_PATH   Path to package containing test modules
MODULE      Name of test module to run (optional, if not provided, run all)
"""


def main(sdk_path, test_path, module=None):
    p = dirname(abspath(test_path))
    sys.path.append(p)
    sys.path.insert(0, sdk_path)
    sys.path.insert(0, 'lib')
    print sys.path

    import dev_appserver

    dev_appserver.fix_sys_path()
    if module and module != 'all':
        suite = unittest.loader.TestLoader().discover(test_path, pattern=module)
    else:
        suite = unittest.loader.TestLoader().discover(test_path)
    test_result = unittest.TextTestRunner(verbosity=2).run(suite)
    sys.exit(0 if test_result.wasSuccessful() else 1)


if __name__ == '__main__':
    parser = optparse.OptionParser(USAGE)
    options, args = parser.parse_args()
    if len(args) < 2:
        print 'Error: 2+ arguments required.'
        parser.print_help()
        sys.exit(1)
    SDK_PATH = args[0]
    TEST_PATH = args[1]
    MODULE = args[2] if len(args) > 2 else None
    main(SDK_PATH, TEST_PATH, module=MODULE)
