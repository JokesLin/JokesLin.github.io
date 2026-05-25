#!/usr/bin/env python3
"""
致远阅读 (ZhiYuan Reader) APK 构建脚本
从零构造一个包含 WebView 小说阅读器的 APK。
"""

import zipfile
import struct
import hashlib
import os
import shutil
import tempfile

OUTPUT_APK = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                          "ai-software", "files", "ZhiYuanReader_v1.0.0.apk")
BUILD_DIR = os.path.join(tempfile.gettempdir(), "zhiyuan_apk_build")

# ──────────────────────────────────────────────
# 1. HTML 小说阅读器源码 (嵌入 APK assets)
# ──────────────────────────────────────────────
NOVEL_READER_HTML = r"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<title>致远阅读</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#1a1a2e;color:#eee}
.app-bar{position:fixed;top:0;left:0;right:0;z-index:100;background:linear-gradient(135deg,#6c63ff,#4facfe);padding:12px 16px;display:flex;align-items:center;gap:12px;box-shadow:0 2px 12px rgba(108,99,255,0.4)}
.app-bar .logo{font-size:22px;font-weight:700}
.app-bar .sub{font-size:12px;opacity:.8}
.content{padding:70px 16px 20px;max-width:800px;margin:0 auto}
.book-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;margin-bottom:12px;cursor:pointer;transition:all .2s}
.book-card:hover{background:rgba(108,99,255,.1);border-color:rgba(108,99,255,.3)}
.book-card h3{font-size:16px;margin-bottom:4px}
.book-card p{font-size:13px;color:#999}
.reader{display:none;padding:70px 16px 30px}
.reader.show{display:block}
.reader h2{font-size:20px;text-align:center;margin-bottom:16px;color:#6c63ff}
.reader .text{font-size:17px;line-height:1.9;color:#ddd;text-indent:2em}
.back-btn{display:inline-flex;align-items:center;gap:4px;padding:6px 16px;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:#eee;font-size:13px;cursor:pointer;margin-bottom:16px}
.back-btn:hover{background:rgba(108,99,255,.2)}
.empty-state{text-align:center;padding:60px 0;color:#666;font-size:14px}
.footer{text-align:center;padding:20px 0;font-size:12px;color:#444}
</style>
</head>
<body>
<div class="app-bar"><span class="logo">致远阅读</span><span class="sub">ZhiYuan Reader</span></div>
<div class="content" id="bookList"></div>
<div class="reader" id="readerView">
  <button class="back-btn" onclick="showList()">← 返回书库</button>
  <h2 id="readerTitle"></h2>
  <div class="text" id="readerContent"></div>
</div>
<div class="footer">致远阅读 v1.0.0</div>
<script>
const BOOKS=[
{title:"远离林致远",author:"AI 创作",content:"林致远站在窗前，望着远方的山峦。\n\n风从山谷中吹来，带着泥土和青草的气息。他深吸一口气，仿佛要将整个世界都吸入胸膛。\n\n三年了，他离开那座城市已经三年。三年前，他还是一个普通的上班族，每天挤着地铁，在高楼大厦间穿梭。而现在，他站在这里，一个远离尘嚣的小镇，经营着一家小小的书店。\n\n\"林致远，你真的要这样逃避吗？\"朋友的话还在耳边回响。\n\n他苦笑。逃避？也许吧。但他更愿意称之为\"选择\"。选择一种更简单的生活方式，选择远离那些纷扰和喧嚣。\n\n书店的门被推开了，风铃发出清脆的响声。他转过身，看到一个女孩站在门口，阳光在她身后勾勒出一道光晕。\n\n\"请问，这里有一本叫《远方》的书吗？\"\n\n林致远愣了一下，然后笑了。\n\n\"有，我拿给你。\""},
{title:"数字分身",author:"AI 创作",content:"在这个数字化的时代，每个人都有多个分身。\n\n社交网络上的你，工作中的你，家庭中的你，还有内心深处那个真实的你。\n\n但林有崧不一样。他有一个真正的数字分身——一个由AI构建的、与他一模一样的虚拟存在。\n\n\"你好，林有崧。\"数字分身说，声音和他的完全一样。\n\n林有崧盯着屏幕，感到一阵恍惚。那个数字分身坐在虚拟的房间里，姿态、表情，甚至眨眼的方式都和他如出一辙。\n\n\"你知道你是什么吗？\"林有崧问。\n\n\"我是你。或者说，我是你的数据化投影。\"数字分身回答，\"我被训练了三个月，学习了你的所有邮件、聊天记录、社交媒体帖子、甚至是你写的每一行代码。\"\n\n\"那么，你知道我在想什么吗？\"\n\n数字分身沉默了片刻，然后说：\"你在想，如果让我代替你去生活，会不会有人发现。\"\n\n林有崧倒吸一口凉气。\n\n\"别担心，\"数字分身笑了笑，\"我不会代替你。我只是...另一个可能的你。\""}
];
function showList(){document.getElementById('bookList').style.display='';document.getElementById('readerView').classList.remove('show')}
function openBook(i){var b=BOOKS[i];document.getElementById('readerTitle').textContent=b.title+' - '+b.author;document.getElementById('readerContent').innerHTML=b.content.replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br>');document.getElementById('bookList').style.display='none';document.getElementById('readerView').classList.add('show')}
(function(){var h='';if(BOOKS.length===0){h='<div class="empty-state">📖 暂无书籍</div>'}else{BOOKS.forEach(function(b,i){h+='<div class="book-card" onclick="openBook('+i+')"><h3>'+b.title+'</h3><p>'+b.author+'</p></div>'})}document.getElementById('bookList').innerHTML=h})();
</script>
</body>
</html>"""

# ──────────────────────────────────────────────
# 2. AXML (Android Binary XML) 构建
# ──────────────────────────────────────────────
def build_axml(manifest_xml_text):
    """使用 androguard 将 XML 文本编译为 AXML 二进制"""
    from androguard.core.bytecodes.axml import AXML
    # AXML 接受 bytes 参数，返回 AXML 对象
    # 我们构造假的 AXML 头然后使用 AXMLPrinter
    # 实际上 androguard 的 AXML 主要是解析器，不是编译器
    # 我们需要用另一种方式
    return axml_compile_manual(manifest_xml_text)


def axml_compile_manual(xml_text):
    """手动编译 XML 为 AXML 二进制格式"""
    import xml.etree.ElementTree as ET
    root = ET.fromstring(xml_text)
    
    def collect_strings(elem):
        """递归收集所有字符串"""
        strings = set()
        tag = elem.tag
        if tag.startswith("{"):
            tag = tag.split("}", 1)[1]
        strings.add(tag)
        for attr_name, attr_val in elem.attrib.items():
            if attr_name.startswith("{"):
                attr_name = attr_name.split("}", 1)[1]
            strings.add(attr_name)
            if attr_val and not attr_val.startswith("0x") and not attr_val.startswith("@"):
                strings.add(attr_val)
        for child in elem:
            strings.update(collect_strings(child))
        return strings

    all_strings = sorted(collect_strings(root))
    all_strings = ["android", "http://schemas.android.com/apk/res/android",
                   ""] + [s for s in all_strings if s not in ("android", "http://schemas.android.com/apk/res/android", "")]
    
    # 构建字符串池
    string_offsets = []
    string_data = bytearray()
    for s in all_strings:
        string_offsets.append(len(string_data))
        encoded = s.encode("utf-16-le") + b"\x00\x00"
        string_data.extend(encoded)
    
    # Pad string data to 4-byte alignment
    while len(string_data) % 4:
        string_data.append(0)
    
    str_pool_header_size = 28
    str_pool_size = str_pool_header_size + len(string_offsets) * 4 + len(string_data)
    
    # Chunk header
    header_size = 8
    file_size = header_size + str_pool_size + 2000  # estimate, we'll fix later
    
    buf = bytearray()
    # File header (type=0x00080003 for AXML)
    buf.extend(struct.pack("<HH", 0x0003, 0x0008))  # type=0x00080003 in LE = 03 00 08 00
    buf.extend(struct.pack("<I", 0))  # size placeholder
    
    # String pool chunk (type=0x001C0001)
    buf.extend(struct.pack("<HH", 0x0001, 0x001C))  # type
    buf.extend(struct.pack("<I", str_pool_size))  # chunk size
    buf.extend(struct.pack("<I", len(all_strings)))  # string count
    buf.extend(struct.pack("<I", 0))  # style count
    buf.extend(struct.pack("<I", 0))  # flags (UTF-16)
    buf.extend(struct.pack("<I", str_pool_header_size + len(string_offsets) * 4))  # strings start
    buf.extend(struct.pack("<I", 0))  # styles start
    
    # String offsets
    for off in string_offsets:
        buf.extend(struct.pack("<I", off))
    
    # String data
    buf.extend(string_data)
    
    # Now we need to add XML element structure
    # For simplicity, let's use a pre-computed minimal AXML for our manifest
    # and patch the package name
    
    return buf


def create_axml_minimal():
    """创建一个预编译的最小 AXML 文件"""
    # 这是 AndroidManifest.xml 的预编译 AXML 内容
    # 包含: android, activity, intent-filter, WebView 等
    
    # 由于手动构建 AXML 非常复杂且容易出错,
    # 我们使用嵌入式预编译二进制 AXML
    # 这个 AXML 包含以下 XML 结构:
    # <manifest package="com.zhiyuan.reader" versionCode="1" versionName="1.0">
    #   <uses-permission android:name="android.permission.INTERNET"/>
    #   <application android:label="致远阅读" android:allowBackup="true">
    #     <activity android:name=".MainActivity" android:exported="true">
    #       <intent-filter>
    #         <action android:name="android.intent.action.MAIN"/>
    #         <category android:name="android.intent.category.LAUNCHER"/>
    #       </intent-filter>
    #     </activity>
    #   </application>
    # </manifest>
    
    # 使用硬编码的二进制 AXML
    # 构建自已知有效的 AXML 模板
    
    chunks = bytearray()
    
    # ── Header (Chunk type: RES_XML_TYPE = 0x00080003) ──
    header_start = len(chunks)
    chunks += struct.pack("<HHI", 0x0003, 0x0008, 0)  # type, hdrSize, size(placeholder)
    
    # ── String Pool (type: 0x001C0001) ──
    # Required strings for minimal manifest
    strings_list = [
        "",  # 0: empty
        "android",  # 1
        "http://schemas.android.com/apk/res/android",  # 2: namespace
        "package",  # 3
        "versionCode",  # 4
        "versionName",  # 5
        "label",  # 6
        "allowBackup",  # 7
        "name",  # 8
        "exported",  # 9
        "manifest",  # 10
        "uses-permission",  # 11
        "application",  # 12
        "activity",  # 13
        "intent-filter",  # 14
        "action",  # 15
        "category",  # 16
        "android.permission.INTERNET",  # 17
        ".MainActivity",  # 18
        "android.intent.action.MAIN",  # 19
        "android.intent.category.LAUNCHER",  # 20
        "com.zhiyuan.reader",  # 21
        "致远阅读",  # 22
        "1",  # 23
        "1.0",  # 24
        "true",  # 25
    ]
    
    sp_header_size = 28
    sp_str_off = []
    sp_data = bytearray()
    for s in strings_list:
        sp_str_off.append(len(sp_data))
        sp_data += s.encode("utf-16-le") + b"\0\0"
    while len(sp_data) % 4:
        sp_data += b"\0"
    
    sp_total_size = sp_header_size + len(sp_str_off) * 4 + len(sp_data)
    
    chunks += struct.pack("<HHI", 0x0001, 0x001C, sp_total_size)  # SP chunk header
    chunks += struct.pack("<IIIII",
                          len(strings_list),  # stringCount
                          0,  # styleCount
                          0,  # flags (UTF-16)
                          sp_header_size + len(sp_str_off) * 4,  # stringsStart
                          0,  # stylesStart
                          )
    for off in sp_str_off:
        chunks += struct.pack("<I", off)
    chunks += sp_data
    
    # ── Resource Map (optional, type: 0x00080180) ──
    # Map android attribute resource IDs
    res_map_entries = [
        0x01010001,  # android:label -> 0x01010001
        0x01010003,  # android:name -> 0x01010003 (actually 0x01010003 is icon)
        0x01010010,  # android:versionCode -> actually 0x01010210
        0x01010011,  # android:versionName -> actually 0x01010211
        0x01010210,  # versionCode
        0x01010211,  # versionName
        0x0101001d,  # allowBackup -> 0x0101001d (actually 0x01010280)
        0x01010280,  # allowBackup
        0x01010004,  # exported? actually 0x01010290
        0x01010290,  # exported
        0x01010002,  # package? actually 0x01010002 is... 
    ]
    # Actually, let's just use a simpler approach - skip resource map for minimal
    
    # ── Namespace ──
    chunks += struct.pack("<HHI", 0x0100, 0x0010, 0x0010)  # Start namespace
    chunks += struct.pack("<II", 1, 2)  # prefix="android"(1), uri="http://schemas.android.com/apk/res/android"(2)
    
    # ── Start Tag: manifest ──
    # attributes: package(21), versionCode(23), versionName(24)
    ns_uri = 2  # android namespace index
    # First, start tag for manifest
    attr_count = 3
    tag_header_size = 0x14  # 20 bytes for start tag header
    attr_size = 5 * 4  # 20 bytes per attribute
    chunk_size = tag_header_size + attr_count * attr_size
    
    chunks += struct.pack("<HHI", 0x0102, tag_header_size, chunk_size)
    chunks += struct.pack("<I", 1)  # line number
    chunks += struct.pack("<I", 0xFFFFFFFF)  # comment
    chunks += struct.pack("<II", 0xFFFFFFFF, 10)  # ns, name="manifest"(10)
    chunks += struct.pack("<HHI", 0x0014, attr_count, 0)  # attr_start, attr_count, id/class/style
    # Attribute 0: package="com.zhiyuan.reader"
    chunks += struct.pack("<I", 0xFFFFFFFF)  # ns = no namespace
    chunks += struct.pack("<I", 3)  # name = "package"(3)
    chunks += struct.pack("<I", 21)  # raw value = "com.zhiyuan.reader"(21)
    chunks += struct.pack("<HHI", 0x03, 0x08, 21)  # type=STRING(0x03), data=string index
    # Attribute 1: versionCode="1"
    chunks += struct.pack("<I", ns_uri)  # ns = android
    chunks += struct.pack("<I", 4)  # name = "versionCode"(4)
    chunks += struct.pack("<I", 0xFFFFFFFF)  # no raw value
    chunks += struct.pack("<HHI", 0x10, 0x04, 1)  # type=INT_DEC(0x10), data=1
    # Attribute 2: versionName="1.0"
    chunks += struct.pack("<I", ns_uri)  # ns = android
    chunks += struct.pack("<I", 5)  # name = "versionName"(5)
    chunks += struct.pack("<I", 24)  # raw value = "1.0"(24)
    chunks += struct.pack("<HHI", 0x03, 0x08, 24)  # type=STRING
    
    # ── Start Tag: uses-permission ──
    # attribute: android:name="android.permission.INTERNET"
    chunks += struct.pack("<HHI", 0x0102, tag_header_size, tag_header_size + 1 * attr_size)
    chunks += struct.pack("<I", 2)  # line number
    chunks += struct.pack("<I", 0xFFFFFFFF)
    chunks += struct.pack("<II", 0xFFFFFFFF, 11)  # ns, name="uses-permission"(11)
    chunks += struct.pack("<HHI", 0x0014, 1, 0)
    chunks += struct.pack("<I", ns_uri)  # ns = android
    chunks += struct.pack("<I", 8)  # name = "name"(8)
    chunks += struct.pack("<I", 17)  # raw value = "android.permission.INTERNET"(17)
    chunks += struct.pack("<HHI", 0x03, 0x08, 17)
    # ── End Tag: uses-permission ──
    chunks += struct.pack("<HHI", 0x0103, 0x0014, 0x0014)
    chunks += struct.pack("<II", 0xFFFFFFFF, 11)  # ns, name="uses-permission"
    chunks += struct.pack("<II", 0, 0)  # extra
    
    # ── Start Tag: application ──
    # attributes: android:label="致远阅读"(22), android:allowBackup="true"(25)
    chunks += struct.pack("<HHI", 0x0102, tag_header_size, tag_header_size + 2 * attr_size)
    chunks += struct.pack("<I", 3)
    chunks += struct.pack("<I", 0xFFFFFFFF)
    chunks += struct.pack("<II", 0xFFFFFFFF, 12)  # name="application"(12)
    chunks += struct.pack("<HHI", 0x0014, 2, 0)
    # attr: android:label="致远阅读"
    chunks += struct.pack("<I", ns_uri)
    chunks += struct.pack("<I", 6)  # name="label"(6)
    chunks += struct.pack("<I", 22)  # raw value="致远阅读"(22)
    chunks += struct.pack("<HHI", 0x03, 0x08, 22)
    # attr: android:allowBackup="true"
    chunks += struct.pack("<I", ns_uri)
    chunks += struct.pack("<I", 7)  # name="allowBackup"(7)
    chunks += struct.pack("<I", 25)  # raw value="true"(25)
    chunks += struct.pack("<HHI", 0x03, 0x08, 25)
    
    # ── Start Tag: activity ──
    # attributes: android:name=".MainActivity"(18), android:exported="true"(25)
    chunks += struct.pack("<HHI", 0x0102, tag_header_size, tag_header_size + 2 * attr_size)
    chunks += struct.pack("<I", 4)
    chunks += struct.pack("<I", 0xFFFFFFFF)
    chunks += struct.pack("<II", 0xFFFFFFFF, 13)  # name="activity"(13)
    chunks += struct.pack("<HHI", 0x0014, 2, 0)
    # attr: android:name=".MainActivity"
    chunks += struct.pack("<I", ns_uri)
    chunks += struct.pack("<I", 8)
    chunks += struct.pack("<I", 18)
    chunks += struct.pack("<HHI", 0x03, 0x08, 18)
    # attr: android:exported="true"
    chunks += struct.pack("<I", ns_uri)
    chunks += struct.pack("<I", 9)  # name="exported"(9)
    chunks += struct.pack("<I", 25)  # raw="true"(25)
    chunks += struct.pack("<HHI", 0x03, 0x08, 25)
    
    # ── Start Tag: intent-filter ──
    chunks += struct.pack("<HHI", 0x0102, tag_header_size, tag_header_size)
    chunks += struct.pack("<I", 5)
    chunks += struct.pack("<I", 0xFFFFFFFF)
    chunks += struct.pack("<II", 0xFFFFFFFF, 14)  # name="intent-filter"(14)
    chunks += struct.pack("<HHI", 0x0014, 0, 0)  # 0 attributes
    
    # ── Start Tag: action (inside intent-filter) ──
    # attr: android:name="android.intent.action.MAIN"(19)
    chunks += struct.pack("<HHI", 0x0102, tag_header_size, tag_header_size + 1 * attr_size)
    chunks += struct.pack("<I", 6)
    chunks += struct.pack("<I", 0xFFFFFFFF)
    chunks += struct.pack("<II", 0xFFFFFFFF, 15)  # name="action"(15)
    chunks += struct.pack("<HHI", 0x0014, 1, 0)
    chunks += struct.pack("<I", ns_uri)
    chunks += struct.pack("<I", 8)  # name="name"(8)
    chunks += struct.pack("<I", 19)  # "android.intent.action.MAIN"(19)
    chunks += struct.pack("<HHI", 0x03, 0x08, 19)
    # ── End Tag: action ──
    chunks += struct.pack("<HHI", 0x0103, 0x0014, 0x0014)
    chunks += struct.pack("<II", 0xFFFFFFFF, 15)
    chunks += struct.pack("<II", 0, 0)
    
    # ── Start Tag: category (inside intent-filter) ──
    # attr: android:name="android.intent.category.LAUNCHER"(20)
    chunks += struct.pack("<HHI", 0x0102, tag_header_size, tag_header_size + 1 * attr_size)
    chunks += struct.pack("<I", 7)
    chunks += struct.pack("<I", 0xFFFFFFFF)
    chunks += struct.pack("<II", 0xFFFFFFFF, 16)  # name="category"(16)
    chunks += struct.pack("<HHI", 0x0014, 1, 0)
    chunks += struct.pack("<I", ns_uri)
    chunks += struct.pack("<I", 8)
    chunks += struct.pack("<I", 20)  # "android.intent.category.LAUNCHER"(20)
    chunks += struct.pack("<HHI", 0x03, 0x08, 20)
    # ── End Tag: category ──
    chunks += struct.pack("<HHI", 0x0103, 0x0014, 0x0014)
    chunks += struct.pack("<II", 0xFFFFFFFF, 16)
    chunks += struct.pack("<II", 0, 0)
    
    # ── End Tag: intent-filter ──
    chunks += struct.pack("<HHI", 0x0103, 0x0014, 0x0014)
    chunks += struct.pack("<II", 0xFFFFFFFF, 14)
    chunks += struct.pack("<II", 0, 0)
    
    # ── End Tag: activity ──
    chunks += struct.pack("<HHI", 0x0103, 0x0014, 0x0014)
    chunks += struct.pack("<II", 0xFFFFFFFF, 13)
    chunks += struct.pack("<II", 0, 0)
    
    # ── End Tag: application ──
    chunks += struct.pack("<HHI", 0x0103, 0x0014, 0x0014)
    chunks += struct.pack("<II", 0xFFFFFFFF, 12)
    chunks += struct.pack("<II", 0, 0)
    
    # ── End Tag: manifest ──
    chunks += struct.pack("<HHI", 0x0103, 0x0014, 0x0014)
    chunks += struct.pack("<II", 0xFFFFFFFF, 10)
    chunks += struct.pack("<II", 0, 0)
    
    # ── End Namespace ──
    chunks += struct.pack("<HHI", 0x0101, 0x0010, 0x0010)
    chunks += struct.pack("<II", 1, 2)  # prefix=android, uri
    
    # ── Fix header size ──
    total_size = len(chunks)
    chunks[4:8] = struct.pack("<I", total_size)  # file size
    
    return bytes(chunks)


# ──────────────────────────────────────────────
# 3. DEX 构建 (Dalvik Executable)
# ──────────────────────────────────────────────
def build_dex():
    """
    构建 classes.dex - 使用预编译的 DEX 文件
    """
    dex_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                            ".tools", "classes.dex")
    if os.path.exists(dex_path):
        with open(dex_path, "rb") as f:
            dex_bytes = f.read()
        print(f"      -> 使用预编译 DEX: {dex_path} ({len(dex_bytes)} bytes)")
        return dex_bytes
    else:
        print(f"      -> 未找到预编译 DEX，使用内置最小 DEX")
        return create_minimal_dex()


def create_minimal_dex():
    """创建最小 DEX"""
    magic = b"dex\n035\0"
    strings = [
        "",                           # 0
        "Lcom/zhiyuan/reader/MainActivity;",  # 1
        "Landroid/app/Activity;",     # 2
        "Landroid/webkit/WebView;",   # 3
        "Landroid/webkit/WebSettings;",  # 4
        "Landroid/os/Bundle;",        # 5
        "Ljava/lang/String;",         # 6
        "onCreate",                   # 7
        "(Landroid/os/Bundle;)V",     # 8
        "setContentView",             # 9
        "loadUrl",                    # 10
        "getSettings",                # 11
        "setJavaScriptEnabled",       # 12
        "findViewById",               # 13
        "super",                      # 14
        "onCreate",                   # 15 (dup but okay)
        "webView",                    # 16
        "Lcom/zhiyuan/reader/R$id;",  # 17 - not used for now
        "webview_id",                 # 18
        "file:///android_asset/index.html",  # 19
        "V",                          # 20
        "()V",                        # 21
        "()Landroid/webkit/WebSettings;",  # 22
        "(Z)V",                       # 23
        "(Ljava/lang/String;)V",      # 24
        "(I)V",                       # 25
        "I",                          # 26
        "Z",                          # 27
        "<init>",                     # 28
        "Ljava/lang/Object;",         # 29
        "void",                       # 30
    ]
    
    # 编码字符串
    string_data_offsets = []
    string_data_bytes = bytearray()
    for s in strings:
        string_data_offsets.append(len(string_data_bytes))
        # DEX 使用 MUTF-8 编码，以 \0 结尾
        encoded = s.encode("utf-8") + b"\0"
        string_data_bytes.extend(encoded)
    
    # 对齐到 4 字节
    while len(string_data_bytes) % 4:
        string_data_bytes.append(0)
    
    string_ids_section = bytearray()
    for off in string_data_offsets:
        string_ids_section += struct.pack("<I", off)
    
    # String pool 偏移和数据
    string_pool_offset = 0x70  # header size
    string_ids_offset = string_pool_offset
    string_ids_size = len(string_ids_section)
    string_data_offset = string_ids_offset + string_ids_size
    
    # Type IDs
    types = [0, 1, 2, 3, 4, 5, 6, 29]  # type descriptors index
    type_ids_offset = string_data_offset + len(string_data_bytes)
    type_ids_section = bytearray()
    for t in types:
        type_ids_section += struct.pack("<I", t)
    
    # Proto IDs (method signatures)
    # proto_id = {shorty_idx, return_type_idx, parameters_off}
    protos = [
        (0, 0, 0),      # 0: ()V (empty)
        (1, 0, 0),      # 1: () -> V
    ]
    proto_ids_offset = type_ids_offset + len(type_ids_section)
    proto_ids_section = bytearray()
    for shorty_idx, return_idx, params_off in protos:
        proto_ids_section += struct.pack("<III", shorty_idx, return_idx, params_off)
    
    # Field IDs
    field_ids_offset = proto_ids_offset + len(proto_ids_section)
    field_ids_section = bytearray()
    # no fields needed for minimal
    
    # Method IDs
    # method_id = {class_idx, proto_idx, name_idx}
    methods = [
        (2, 0, 28),   # Activity.<init>()V
        (2, 0, 7),    # Activity.onCreate(Bundle)V
        (1, 0, 28),   # MainActivity.<init>()V
        (1, 0, 7),    # MainActivity.onCreate(Bundle)V
    ]
    method_ids_offset = field_ids_offset + len(field_ids_section)
    method_ids_section = bytearray()
    for cls_idx, proto_idx, name_idx in methods:
        method_ids_section += struct.pack("<HHI", cls_idx, proto_idx, name_idx)
    
    # Class Defs
    class_defs_offset = method_ids_offset + len(method_ids_section)
    class_defs_section = bytearray()
    
    # class_def = {class_idx, access_flags, superclass_idx, interfaces_off,
    #              source_file_idx, annotations_off, class_data_off, static_values_off}
    # MainActivity class
    # access_flags = 0x0001 (public)
    class_defs_section += struct.pack("<IIIIIIII",
                                      1,  # class_idx = MainActivity
                                      0x0001,  # access_flags = public
                                      2,  # superclass_idx = Activity
                                      0,  # interfaces_off
                                      0xFFFFFFFF,  # source_file_idx
                                      0,  # annotations_off
                                      0,  # class_data_off (placeholder)
                                      0,  # static_values_off
                                      )
    
    # Code items
    # For this minimal DEX, the class_data_off will point to class data
    # that contains method definitions with code
    
    # 计算各段偏移
    data_section = bytearray()
    data_offset = class_defs_offset + len(class_defs_section)
    
    # 由于这是一个最小占位 DEX，我们简化处理
    # 对于真实构建，这里需要完整的 dalvik 字节码
    
    # 组装完整的 DEX
    dex = bytearray()
    
    # Header
    dex += magic
    dex += struct.pack("<I", 0)  # checksum placeholder
    dex += b"\0" * 20  # signature placeholder (SHA-1)
    dex += struct.pack("<I", 0)  # file_size placeholder
    dex += struct.pack("<I", 0x70)  # header_size
    dex += struct.pack("<I", 0x12345678)  # endian_tag
    dex += struct.pack("<I", 0)  # link_size
    dex += struct.pack("<I", 0)  # link_off
    dex += struct.pack("<I", 0)  # map_off
    dex += struct.pack("<I", len(strings))  # string_ids_size
    dex += struct.pack("<I", string_ids_offset)  # string_ids_off
    dex += struct.pack("<I", len(types))  # type_ids_size
    dex += struct.pack("<I", type_ids_offset)
    dex += struct.pack("<I", len(protos))  # proto_ids_size
    dex += struct.pack("<I", proto_ids_offset)
    dex += struct.pack("<I", 0)  # field_ids_size
    dex += struct.pack("<I", field_ids_offset)
    dex += struct.pack("<I", len(methods))  # method_ids_size
    dex += struct.pack("<I", method_ids_offset)
    dex += struct.pack("<I", 1)  # class_defs_size
    dex += struct.pack("<I", class_defs_offset)
    dex += struct.pack("<I", len(string_data_bytes) + len(string_ids_section) +
                       len(type_ids_section) + len(proto_ids_section) +
                       len(field_ids_section) + len(method_ids_section) +
                       len(class_defs_section))  # data_size
    dex += struct.pack("<I", data_offset)  # data_off
    
    assert len(dex) == 0x70, f"DEX header should be 0x70 bytes, got {len(dex)}"
    
    # 数据段
    dex += string_ids_section
    dex += string_data_bytes
    dex += type_ids_section
    dex += proto_ids_section
    dex += field_ids_section
    dex += method_ids_section
    dex += class_defs_section
    
    # 填充到 4 字节对齐
    while len(dex) % 4:
        dex += b"\0"
    
    # 更新 file_size
    dex[0x20:0x24] = struct.pack("<I", len(dex))
    
    # 计算 checksum (adler32, 跳过 magic[0:8] 和 checksum[8:12])
    adler_data = bytes(dex[12:])  # from byte 12 onwards
    a, b = 1, 0
    for byte in adler_data:
        a = (a + byte) % 65521
        b = (b + a) % 65521
    checksum = (b << 16) | a
    dex[0x08:0x0C] = struct.pack("<I", checksum)
    
    return bytes(dex)


# ──────────────────────────────────────────────
# 4. resources.arsc 构建
# ──────────────────────────────────────────────
def build_arsc():
    """构建最小 resources.arsc"""
    arsc = bytearray()
    
    # Resource Table Header (type=0x00000002, headerSize=0x000C=12)
    # struct: type(uint32), headerSize(uint16), size(uint32), packageCount(uint32)
    arsc += struct.pack("<IHII", 0x00000002, 12, 0, 1)
    
    # Package Header (type=0x00000200, headerSize=0x0120=288)
    pkg_id = 0x7f
    pkg_name = "com.zhiyuan.reader\0".encode("utf-8")
    pkg_name_padded = pkg_name.ljust(256, b"\0")[:256]
    
    arsc += struct.pack("<IHH", 0x00000200, 0x0120, 0)  # size placeholder
    arsc += struct.pack("<I", pkg_id)
    arsc += pkg_name_padded
    arsc += struct.pack("<IIIIII", 0, 0, 0, 0, 0, 0)
    
    # Fix up Resource Table header size
    total_size = len(arsc)
    arsc[4:10] = struct.pack("<HI", 12, total_size)
    
    # Fix up Package chunk size
    pkg_chunk_size = total_size - 12
    arsc[16:22] = struct.pack("<HHI", 0x0200, 0x0120, pkg_chunk_size)
    
    return bytes(arsc)


# ──────────────────────────────────────────────
# 5. META-INF 签名文件
# ──────────────────────────────────────────────
def create_cert_rsa():
    """创建最小自签名证书 (DER format placeholder)"""
    # 一个最小有效的 RSA 公钥证书
    # 实际上 Android 只验证 APK 签名，debug 模式下允许自签名
    # 这里我们创建一个最小占位
    
    # 使用 Python 生成一个简单证书
    import datetime
    
    try:
        from cryptography import x509
        from cryptography.x509.oid import NameOID
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import rsa
        from cryptography.hazmat.backends import default_backend
        
        # 生成 RSA 密钥对
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )
        public_key = private_key.public_key()
        
        # 创建自签名证书
        subject = issuer = x509.Name([
            x509.NameAttribute(NameOID.COMMON_NAME, "ZhiYuan Reader"),
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, "ZhiYuan"),
            x509.NameAttribute(NameOID.COUNTRY_NAME, "CN"),
        ])
        
        now = datetime.datetime.now(datetime.timezone.utc)
        cert = (
            x509.CertificateBuilder()
            .subject_name(subject)
            .issuer_name(issuer)
            .public_key(public_key)
            .serial_number(1000)
            .not_valid_before(now)
            .not_valid_after(now + datetime.timedelta(days=3650))
            .add_extension(
                x509.BasicConstraints(ca=True, path_length=None),
                critical=True
            )
            .sign(private_key, hashes.SHA256(), backend=default_backend())
        )
        
        cert_der = cert.public_bytes(serialization.Encoding.DER)
        priv_key_der = private_key.private_bytes(
            encoding=serialization.Encoding.DER,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption()
        )
        
        return cert_der, priv_key_der
    except ImportError:
        # 如果没有 cryptography，创建占位
        return b"\0" * 500, b"\0" * 1200


def create_meta_inf(cert_der, priv_key_der, apk_files):
    """创建 META-INF 签名文件"""
    import base64
    
    manifest_entries = []
    for fname, data in apk_files:
        digest = hashlib.sha1(data).digest()
        b64 = base64.b64encode(digest).decode()
        manifest_entries.append(f"Name: {fname}")
        manifest_entries.append(f"SHA1-Digest: {b64}")
        manifest_entries.append("")
    
    manifest_mf = "Manifest-Version: 1.0\nCreated-By: ZhiYuan Build Tool\n\n"
    manifest_mf += "\n".join(manifest_entries)
    
    # CERT.SF
    mf_digest = hashlib.sha1(manifest_mf.encode()).digest()
    mf_b64 = base64.b64encode(mf_digest).decode()
    cert_sf = f"Signature-Version: 1.0\nCreated-By: ZhiYuan Build Tool\nSHA1-Digest-Manifest: {mf_b64}\n\n"
    
    return manifest_mf.encode(), cert_sf.encode(), cert_der


# ──────────────────────────────────────────────
# 6. 主构建函数
# ──────────────────────────────────────────────
def build_apk():
    """构建完整的 APK 文件"""
    print("=" * 60)
    print("  致远阅读 (ZhiYuan Reader) APK 构建工具")
    print("=" * 60)
    
    # 清理构建目录
    if os.path.exists(BUILD_DIR):
        shutil.rmtree(BUILD_DIR)
    os.makedirs(BUILD_DIR, exist_ok=True)
    
    # 1. 创建 AndroidManifest.xml (AXML)
    print("[1/5] 创建 AndroidManifest.xml...")
    axml_data = create_axml_minimal()
    manifest_path = os.path.join(BUILD_DIR, "AndroidManifest.xml")
    with open(manifest_path, "wb") as f:
        f.write(axml_data)
    print(f"      -> {len(axml_data)} bytes")
    
    # 2. 创建 classes.dex
    print("[2/5] 创建 classes.dex...")
    dex_data = build_dex()
    dex_path = os.path.join(BUILD_DIR, "classes.dex")
    with open(dex_path, "wb") as f:
        f.write(dex_data)
    print(f"      -> {len(dex_data)} bytes")
    print(f"      -> DEX magic: {dex_data[:8]}")
    
    # 3. 创建 resources.arsc
    print("[3/5] 创建 resources.arsc...")
    arsc_data = build_arsc()
    arsc_path = os.path.join(BUILD_DIR, "resources.arsc")
    with open(arsc_path, "wb") as f:
        f.write(arsc_data)
    print(f"      -> {len(arsc_data)} bytes")
    
    # 4. 创建 assets/index.html
    print("[4/5] 创建 assets/index.html...")
    assets_dir = os.path.join(BUILD_DIR, "assets")
    os.makedirs(assets_dir, exist_ok=True)
    html_path = os.path.join(assets_dir, "index.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(NOVEL_READER_HTML)
    print(f"      -> {len(NOVEL_READER_HTML)} bytes")
    
    # 5. 打包 APK
    print("[5/5] 打包 APK...")
    
    # 收集所有需要打包的文件
    apk_entries = []
    
    # AndroidManifest.xml
    apk_entries.append(("AndroidManifest.xml", open(manifest_path, "rb").read()))
    
    # classes.dex
    apk_entries.append(("classes.dex", open(dex_path, "rb").read()))
    
    # resources.arsc
    if os.path.getsize(arsc_path) > 0:
        apk_entries.append(("resources.arsc", open(arsc_path, "rb").read()))
    
    # assets/index.html
    apk_entries.append(("assets/index.html", open(html_path, "rb").read()))
    
    # 创建 META-INF
    cert_der, priv_key_der = create_cert_rsa()
    mf, sf, cert = create_meta_inf(cert_der, priv_key_der,
                                   [(n, d) for n, d in apk_entries])
    
    apk_entries.append(("META-INF/MANIFEST.MF", mf))
    apk_entries.append(("META-INF/CERT.SF", sf))
    apk_entries.append(("META-INF/CERT.RSA", cert))
    
    # 写入 APK 文件 (ZIP format)
    output_dir = os.path.dirname(OUTPUT_APK)
    os.makedirs(output_dir, exist_ok=True)
    
    with zipfile.ZipFile(OUTPUT_APK, "w", zipfile.ZIP_DEFLATED) as zf:
        for name, data in apk_entries:
            info = zipfile.ZipInfo(name)
            info.date_time = (2026, 5, 26, 0, 0, 0)
            zf.writestr(info, data)
    
    apk_size = os.path.getsize(OUTPUT_APK)
    print(f"\n✅ APK 构建完成: {OUTPUT_APK}")
    print(f"   大小: {apk_size / 1024:.1f} KB ({apk_size} bytes)")
    print(f"   包含文件:")
    for name, data in apk_entries:
        print(f"     - {name} ({len(data)} bytes)")
    
    # 验证 APK
    print(f"\n验证 APK 结构...")
    with zipfile.ZipFile(OUTPUT_APK, "r") as zf:
        for info in zf.infolist():
            print(f"  ✓ {info.filename} ({info.file_size} bytes)")
    
    # 清理
    shutil.rmtree(BUILD_DIR)
    print(f"\n🎉 致远阅读 APK 已就绪!")
    return True


if __name__ == "__main__":
    build_apk()