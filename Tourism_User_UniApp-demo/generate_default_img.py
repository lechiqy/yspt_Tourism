import struct, zlib, os

def create_png(filepath, text):
    width, height = 200, 160
    
    def write_chunk(chunk_type, data):
        chunk = chunk_type + data
        return struct.pack('>I', len(data)) + chunk + struct.pack('>I', zlib.crc32(chunk) & 0xFFFFFFFF)
    
    signature = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    
    raw_data = b''
    for y in range(height):
        raw_data += b'\x00'
        for x in range(width):
            raw_data += bytes([220, 220, 220])  # 浅灰色填充
    
    compressed = zlib.compress(raw_data)
    
    with open(filepath, 'wb') as f:
        f.write(signature)
        f.write(write_chunk(b'IHDR', ihdr_data))
        f.write(write_chunk(b'IDAT', compressed))
        f.write(write_chunk(b'IEND', b''))

create_png(r'G:\0.1.lechiqy\软件工程\Tourism_User_UniApp-demo\static\default.jpg', '')
print('default.jpg 生成成功！')
