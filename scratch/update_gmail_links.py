import glob

files = glob.glob('*.html')
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    
    old_target = 'href="mailto:toppkoaesthetic@gmail.com"'
    new_target = 'href="https://mail.google.com/mail/?view=cm&fs=1&to=toppkoaesthetic@gmail.com&su=Clinic%20Inquiry%20-%20Toppko%20Aesthetics" target="_blank" rel="noopener"'
    
    if old_target in content:
        content = content.replace(old_target, new_target)
        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(content)
        print('Updated mailto links in', f)
