from egen.table import Table

t = Table()
t.load_config('egen_config.txt')
t.load_data('data/egen_data.csv')
t.load_lookup('data/lookup.csv')
t.generate()
t.write()
