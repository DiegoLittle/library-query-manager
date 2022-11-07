import re
regex_type = type(re.compile(""))

# This is not perfect. It breaks if there is a parenthesis in the regex.
re_term = re.compile(r"(?<!\\)\(\?P\<(?P<name>[\w_\d]+)\>(?P<regex>[^\)]*)\)")

class BadFormatException(Exception):
    pass

class RegexTemplate(object):
    def __init__(self, r, *args, **kwargs):
        self.r = re.compile(r, *args, **kwargs)
    
    def __repr__(self):
        return "<RegexTemplate '%s'>"%self.r.pattern
    
    def match(self, *args, **kwargs):
        '''The regex match function'''
        return self.r.match(*args, **kwargs)
    
    def search(self, *args, **kwargs):
        '''The regex match function'''
        return self.r.search(*args, **kwargs)
    
    def format(self, **kwargs):
        '''Format this regular expression in a similar way as string.format.
        Only supports true keyword replacement, not group replacement.'''
        pattern = self.r.pattern
        def replace(m):
            name = m.group('name')
            reg = m.group('regex')
            val = kwargs[name]
            if not re.match(reg, val):
                raise BadFormatException("Template variable '%s' has a value "
                    "of %s, does not match regex %s."%(name, val, reg))
            return val
        
        # The regex sub function does most of the work
        value = re_term.sub(replace, pattern)
        
        # Now we have un-escape the special characters. 
        return re.sub(r"\\([.\(\)\[\]])", r"\1", value)

def compile(*args, **kwargs):
    return RegexTemplate(*args, **kwargs)
    
if __name__ == '__main__':
    # Construct a typical URL routing regular expression
    r = RegexTemplate(r"http://example\.com/(?P<year>\d\d\d\d)/(?P<title>\w+)")
    print(r)
    
    # This should match
    print(r.match("http://example.com/2015/article"))
    # Generate the same URL using url formatting.
    print(r.format(year = "2015", title = "article"))
    
    # This should not match
    print(r.match("http://example.com/abcd/article"))
    # This will raise an exception because year is not formatted properly
    try:
        print(r.format(year = "15", title = "article"))
    except BadFormatException as e:
        print(e)
    