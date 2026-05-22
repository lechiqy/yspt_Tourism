# -*- coding: utf-8 -*-
path = r'G:\0.1.lechiqy\软件工程\Tourism_User_UniApp-demo\pages\Hongji\hongji.vue'
with open(path, 'rb') as f:
    raw = f.read()
content = raw.decode('utf-8')
norm = content.replace('\r\n', '\n').replace('\r', '\n')

# Find playAudio and replace it using position-based approach
idx = norm.find('playAudio(spot)')
if idx < 0:
    print('playAudio not found')
    exit()

# Go back to find the method start (tab + playAudio)
line_start = norm.rfind('\n', 0, idx)
# Find the method end - look for the closing },\n followed by next method or closing brace
# Find the matching closing brace
method_start = norm.find('{', idx)
brace_count = 0
pos = method_start
while pos < len(norm):
    if norm[pos] == '{':
        brace_count += 1
    elif norm[pos] == '}':
        brace_count -= 1
        if brace_count == 0:
            break
    pos += 1

method_end = pos + 1
# Include the trailing comma or newline
rest = norm[method_end:].lstrip()
if rest.startswith(','):
    method_end = norm.index(',', method_end) + 1

old_method = norm[line_start:method_end].strip()

new_method = '''playAudio(spot) {
\t\t\t\tif (this.playingSpot && this.playingSpot.name === spot.name) {
\t\t\t\t\tif (this.innerAudio) {
\t\t\t\t\t\tthis.innerAudio.stop();
\t\t\t\t\t}
\t\t\t\t\tthis.playingSpot = null;
\t\t\t\t\treturn;
\t\t\t\t}
\t\t\t\tconst plugin = requirePlugin('WechatSI');
\t\t\t\tconst text = spot.name + '\\u3002' + spot.desc;
\t\t\t\tuni.showLoading({ title: '\\u5408\\u6210\\u4e2d' });
\t\t\t\tplugin.textToSpeech({
\t\t\t\t\tlang: 'zh_CN',
\t\t\t\t\ttts: true,
\t\t\t\t\tcontent: text,
\t\t\t\t\tsuccess: (res) => {
\t\t\t\t\t\tuni.hideLoading();
\t\t\t\t\t\tif (this.innerAudio) {
\t\t\t\t\t\t\tthis.innerAudio.stop();
\t\t\t\t\t\t}
\t\t\t\t\t\tthis.innerAudio = uni.createInnerAudioContext();
\t\t\t\t\t\tthis.innerAudio.src = res.filename;
\t\t\t\t\t\tthis.playingSpot = spot;
\t\t\t\t\t\tthis.innerAudio.onEnded = () => {
\t\t\t\t\t\t\tthis.playingSpot = null;
\t\t\t\t\t\t};
\t\t\t\t\t\tthis.innerAudio.onError = () => {
\t\t\t\t\t\t\tthis.playingSpot = null;
\t\t\t\t\t\t\tuni.showToast({ title: '\\u64ad\\u653e\\u5931\\u8d25', icon: 'none' });
\t\t\t\t\t\t};
\t\t\t\t\t\tthis.innerAudio.play();
\t\t\t\t\t},
\t\t\t\t\tfail: (err) => {
\t\t\t\t\t\tuni.hideLoading();
\t\t\t\t\t\tuni.showToast({ title: '\\u8bed\\u97f3\\u5408\\u6210\\u5931\\u8d25', icon: 'none' });
\t\t\t\t\t}
\t\t\t\t});
\t\t\t},'''

norm = norm[:line_start+1] + new_method + norm[method_end:]
print('playAudio method replaced')

# Also add onHide
old_onload = 'onLoad() {\n\t\t\t\tthis.loadCheckinStatus();\n\t\t\t},'
new_onload = 'onLoad() {\n\t\t\t\tthis.loadCheckinStatus();\n\t\t\t},\n\t\t\tonHide() {\n\t\t\t\tif (this.innerAudio) {\n\t\t\t\t\tthis.innerAudio.stop();\n\t\t\t\t\tthis.playingSpot = null;\n\t\t\t\t}\n\t\t\t},'

if old_onload in norm:
    norm = norm.replace(old_onload, new_onload)
    print('onHide added')
else:
    print('onLoad NOT found for onHide')

output = norm.replace('\n', '\r\n')
with open(path, 'wb') as f:
    f.write(output.encode('utf-8'))

print('Done')
