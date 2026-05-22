# -*- coding: utf-8 -*-
path = r'G:\0.1.lechiqy\软件工程\Tourism_User_UniApp-demo\pages\Hongji\hongji.vue'
with open(path, 'rb') as f:
    raw = f.read()
content = raw.decode('utf-8')
norm = content.replace('\r\n', '\n').replace('\r', '\n')

# Replace the playAudio method
old_play = '''\t\t\t\tplayAudio(spot) {
\t\t\t\t\tuni.showToast({
\t\t\t\t\t\ttitle: '语音讲解开发中',
\t\t\t\t\t\ticon: 'none'
\t\t\t\t\t});
\t\t\t\t},'''

new_play = '''\t\t\t\tplayAudio(spot) {
\t\t\t\t\tif (this.playingSpot && this.playingSpot.name === spot.name) {
\t\t\t\t\t\tif (this.innerAudio) {
\t\t\t\t\t\t\tthis.innerAudio.stop();
\t\t\t\t\t\t}
\t\t\t\t\t\tthis.playingSpot = null;
\t\t\t\t\t\treturn;
\t\t\t\t\t}
\t\t\t\t\tconst plugin = requirePlugin('WechatSI');
\t\t\t\t\tconst text = spot.name + '。' + spot.desc;
\t\t\t\t\tuni.showLoading({ title: '合成中' });
\t\t\t\t\tplugin.textToSpeech({
\t\t\t\t\t\tlang: 'zh_CN',
\t\t\t\t\t\ttts: true,
\t\t\t\t\t\tcontent: text,
\t\t\t\t\t\tsuccess: (res) => {
\t\t\t\t\t\t\tuni.hideLoading();
\t\t\t\t\t\t\tif (this.innerAudio) {
\t\t\t\t\t\t\t\tthis.innerAudio.stop();
\t\t\t\t\t\t\t}
\t\t\t\t\t\t\tthis.innerAudio = uni.createInnerAudioContext();
\t\t\t\t\t\t\tthis.innerAudio.src = res.filename;
\t\t\t\t\t\t\tthis.playingSpot = spot;
\t\t\t\t\t\t\tthis.innerAudio.onEnded = () => {
\t\t\t\t\t\t\t\tthis.playingSpot = null;
\t\t\t\t\t\t\t};
\t\t\t\t\t\t\tthis.innerAudio.onError = () => {
\t\t\t\t\t\t\t\tthis.playingSpot = null;
\t\t\t\t\t\t\t\tuni.showToast({ title: '播放失败', icon: 'none' });
\t\t\t\t\t\t\t};
\t\t\t\t\t\t\tthis.innerAudio.play();
\t\t\t\t\t\t},
\t\t\t\t\t\tfail: (err) => {
\t\t\t\t\t\t\tuni.hideLoading();
\t\t\t\t\t\t\tuni.showToast({ title: '语音合成失败', icon: 'none' });
\t\t\t\t\t\t}
\t\t\t\t\t});
\t\t\t\t},'''

if old_play in norm:
    norm = norm.replace(old_play, new_play)
    print('playAudio method replaced')
else:
    print('playAudio old NOT found')

# Add playingSpot to data
old_data = "checkedSpots: [],\n\t\t\t\t\tspotPopupShow: false,"
new_data = "checkedSpots: [],\n\t\t\t\t\tplayingSpot: null,\n\t\t\t\t\tinnerAudio: null,\n\t\t\t\t\tspotPopupShow: false,"

if old_data in norm:
    norm = norm.replace(old_data, new_data)
    print('playingSpot added to data')
else:
    print('data NOT found for playingSpot')

# Add onLoad requirePlugin
old_onload = '''\t\t\tonLoad() {
\t\t\t\tthis.loadCheckinStatus();
\t\t\t},'''

new_onload = '''\t\t\tonLoad() {
\t\t\t\tthis.loadCheckinStatus();
\t\t\t},
\t\t\tonHide() {
\t\t\t\tif (this.innerAudio) {
\t\t\t\t\tthis.innerAudio.stop();
\t\t\t\t\tthis.playingSpot = null;
\t\t\t\t}
\t\t\t},'''

if old_onload in norm:
    norm = norm.replace(old_onload, new_onload)
    print('onHide added')
else:
    print('onLoad NOT found')

output = norm.replace('\n', '\r\n')
with open(path, 'wb') as f:
    f.write(output.encode('utf-8'))

print('Done')
