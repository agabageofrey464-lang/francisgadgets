"""Seeds an admin user and a sample catalog. Safe to re-run (idempotent)."""

import asyncio
import sys
from pathlib import Path
from urllib.parse import quote

sys.path.append(str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.core.utils import generate_unique_slug
from app.models.category import Category
from app.models.product import Product, ProductImage
from app.models.user import User, UserRole

SAMPLE_CATEGORIES = [
    "Smartphones",
    "Tablets",
    "Feature Phones",
    "Laptops",
    "Desktops",
    "Monitors",
    "Printers",
    "Scanners",
    "Projectors",
    "Networking",
    "UPS",
    "Toner & Ink",
    "Money Counting Machines",
    "Paper Shredders",
    "Sound Bars",
    "Home Appliances",
    "GPS & Trackers",
    "CCTV & Security Cameras",
    "Audio",
    "Phone Accessories",
    "Computer Accessories",
    "Installation & Services",
]


# Attribution record for the catalogue photos.
#
# These files were sourced from Wikimedia Commons, downloaded by
# scripts/localize_images.py, and are now served from frontend/public/products/
# so the shop does not depend on someone else's CDN (which rate-limits to HTTP
# 429 on a product grid and 403s clients whose User-Agent it dislikes).
#
# Most are freely licensed but carry an attribution requirement (CC BY-SA);
# self-hosting does not remove it. Credit these sources on the site, or replace
# them with the shop's own product photography before launch.
#
# Each entry is a file on Wikimedia Commons:
#   https://commons.wikimedia.org/wiki/File:<name>
WIKIMEDIA_PHOTO_SOURCES = [
    "2023_Mysz_komputerowa_Logitech_G903_Lightspeed.jpg",
    "ASUS_Wi-Fi_ROUTER_TUF_6500.jpg",
    "ATIV One 5.jpg",
    "About iPad Air 13-inch (M2).jpg",
    "All-in-One PC.jpg",
    "Antec_ISK110_mini-PC_side.JPG",
    "Apple iPad Pro 11.jpg",
    "CCTV_Cameras.png",
    "Computer_case_-_Full_Tower.jpg",
    "DG-Tracker Smile, GPS Vehicle Tracker.jpg",
    "DG-Tracker_Smile,_GPS_Vehicle_Tracker.jpg",
    "DS-2TD95C8-300ZK2FL.jpg",
    "Dell Inspiron One 23 Touch AIO Desktop PC.jpg",
    "Falcon_Northwest_Mach_V_full_tower_desktop_PC.png",
    "Garmin_Etrex_H_7262.jpg",
    "HP All-in-One PC.jpg",
    "Hikvision @ P+R Étoile @ Carouge (50514011831).jpg",
    "Hikvision doorbell with a camera and card lock, Gouda (2020) 01.jpg",
    "IPad Air 11-inch (M3).jpg",
    "IPhone 17 Pro Max.jpg",
    "Infinix Note 50 Pro 4G.jpg",
    "Infinix Smart 4 Plus.jpg",
    "Lenovo_ThinkCentre_AIO_Business_PC.jpeg",
    "MSI_Gaming_Laptop_on_wood_floor.jpg",
    "Monitor_of_mac.jpg",
    "Optiplex_Mid-tower.jpg",
    "Protective_phone_case_for_OnePlus_Nord.jpg",
    "Redmi Note 7 Phone by Xiaomi.jpg",
    "Samsung Galaxy Tab S8 Ultra.jpg",
    "Schenker_VIA14_Laptop_asv2021-01.jpg",
    "Screen_protector.png",
    "Smartphone_mounted_on_car_dashboard_during_a_drive_in_a_modern_vehicle_with_a_focus_on_navigation_use.jpg",
    "Tecno Spark 20.png",
    "UE_Boom_speakers.jpg",
    "USB-C_Digital_AV_Multiport_Adapter.jpeg",
    "Wireless_computer_keyboard_with_mouse_an_USB_receiver.jpg",
    "Xiaomi Redmi Note 10 Pro.jpg",
]


# INTERIM STAND-IN PHOTOS -- REPLACE BEFORE LAUNCH.
#
# These listings had no freely-licensed photo of the exact model, so they show a
# photo of the same *kind* of device instead: a Nokia keypad phone standing in
# for a Tecno one, a Samsung tablet for the Tecno MegaPad, a generic tower for
# the ThinkCentre. The shop owner asked for these as a temporary measure while
# their own product photography is prepared.
#
# They are honest about the category but NOT pictures of the actual stock, which
# a customer could reasonably object to. Swap each one for a real photo of the
# item -- via /admin image upload or _local() -- as soon as shots are available.
# Products whose sourced photo turned out to show the wrong thing entirely --
# audited against the Commons file each image actually came from. Their photos
# were cleared, so the storefront draws its category illustration instead. Upload
# a real photograph via /admin/products/<id> to replace one.
PHOTOS_CLEARED_AS_WRONG = [
    "Annual CCTV Maintenance Contract",
    "Ativa 12-Sheet Micro-Cut Shredder",
    "Bill Counter BC-2020 with UV/MG",
    "Braided USB-C to Lightning Cable 2m",
    "CCTV Site Survey & Quotation",
    "Canon CanoScan LiDE 300 Flatbed",
    "Canon DR-C225 II Document Scanner",
    "Canon PIXMA G3420 Ink Tank Printer",
    "Cassida 5520 UV Bill Counter",
    "Dell 24\" P2422H Full HD IPS Monitor",
    "Epson EB-S41 SVGA 3LCD Projector",
    "Epson EB-X51 XGA 3LCD Projector",
    "Epson EcoTank L3250 All-in-One",
    "Epson Perfection V39 Scanner",
    "Glory GFB-800 Banknote Counter",
    "HP E27 G5 27\" QHD Monitor",
    "HP LaserJet MFP M141a",
    "HP LaserJet Pro M404dn Printer",
    "HP Wired Optical Mouse USB",
    "Hikvision 8-Channel DVR with 1TB HDD",
    "JBL Bar 2.0 All-in-One Soundbar",
    "JBL Tune 510BT Wireless Headphones",
    "Laptop Cooling Pad with 5 Fans",
    "Logitech MK270 Wireless Keyboard & Mouse",
    "Mercury 650VA Line-Interactive UPS",
    "Mikrotik hAP ac lite Router",
    "Nunix 2-Burner Table Top Gas Cooker",
    "Oraimo FreePods 4 Earbuds",
    "Philips Daily Collection Blender HR2221",
    "Portable Mini Note Counter MC-100",
    "Ramtons Dry Iron RM/188",
    "Rexel Momentum X410 Shredder",
    "SanDisk Ultra 64GB USB 3.0 Flash Drive",
    "Seagate 1TB Portable External HDD",
    "Sony WH-CH520 Wireless Headphones",
    "TP-Link Archer C6 AC1200 Router",
    "TP-Link TL-WA855RE Wi-Fi Extender",
    "Tempered Glass Screen Protector",
    "Universal Phone Ring Holder Stand",
    "Von 1.7L Cordless Electric Kettle",
]

STANDIN_PHOTOS_TO_REPLACE = {
    "products/tecno-t313-dual-sim-1-77-display-4mb.jpg": "https://commons.wikimedia.org/wiki/File:A_Nokia_105_feature_phone.jpg",
    "products/tecno-t315-dual-sim-2-4-qqvga-display-4mb.jpg": "https://commons.wikimedia.org/wiki/File:Nokia_130.jpg",
    "products/tecno-t352-dual-sim-1-77-display-4mb.jpg": "https://commons.wikimedia.org/wiki/File:Nokia_105(A_feature_phone).jpg",
    "products/tecno-t353-dual-sim-2-4-qqvga-display-4mb.jpg": "https://commons.wikimedia.org/wiki/File:Wikipidea_on_a_keypad_phone.jpg",
    "products/tecno-t403-dual-sim-2-4-display-4mb-ram-4mb.jpg": "https://commons.wikimedia.org/wiki/File:2_Nokia_dumb_phones.jpg",
    "products/tecno-t455-dual-sim-2-8-display-128mb-rom.jpg": "https://commons.wikimedia.org/wiki/File:Wikipedia_Mobile_on_a_feature_phone.JPG",
    "products/tecno-t485-dual-sim-2-8-display-4mb-ram-4mb.jpg": "https://commons.wikimedia.org/wiki/File:A_Nokia_105_feature_phone.jpg",
    "products/tecno-t529-dual-sim-2-8-display-16mb-rom.jpg": "https://commons.wikimedia.org/wiki/File:Nokia_130.jpg",
    "products/tecno-t663-dual-sim-3-5-touchscreen-128mb.png": "https://commons.wikimedia.org/wiki/File:Tecno_Spark_20.png",
    "products/tecno-megapad-se-11-tablet-4gb-ram.jpg": "https://commons.wikimedia.org/wiki/File:Samsung_Galaxy_Tab_S2_displaying_Android_lock_screen.jpg",
    "products/lenovo-thinkcentre-neo-50t-gen-6-desktop-intel.jpg": "https://commons.wikimedia.org/wiki/File:Midi_tower_PC_case.jpg",
}


def _local(filename: str) -> str:
    # Real photos supplied directly by the store owner, served from the
    # frontend's public/ folder (same-origin relative path).
    return f"/{quote(filename)}"


def _placeholder(label: str) -> str:
    # Used only where no individually-verified real photo of the exact
    # (or a close same-brand) device could be sourced -- e.g. the run of
    # near-identical Tecno keypad phone SKUs. Honest label beats a
    # mismatched or unverified photo.
    from urllib.parse import quote_plus

    return f"https://placehold.co/800x800/582171/ffffff.png?text={quote_plus(label)}&font=roboto"


SAMPLE_PRODUCTS = [
    # --- Smartphones ---
    {
        "name": "Aurora X12 Smartphone",
        "description": "6.5-inch AMOLED display, 128GB storage, triple camera system.",
        "price": 588000, "compare_at_price": 660000, "sku": "AUR-X12",
        "stock_quantity": 25, "category": "Smartphones", "image": _local("products/aurora-x12-smartphone.jpg"),
    },
    {
        "name": "Zenith S9 Smartphone",
        "description": "6.7-inch OLED, 256GB storage, 5G, 108MP main camera.",
        "price": 924000, "compare_at_price": None, "sku": "ZEN-S9",
        "stock_quantity": 18, "category": "Smartphones", "image": _local("products/zenith-s9-smartphone.jpg"),
    },
    {
        "name": "Comet Lite Smartphone",
        "description": "Budget-friendly 6.1-inch display, 64GB storage, all-day battery.",
        "price": 235000, "compare_at_price": 276000, "sku": "COM-LITE",
        "stock_quantity": 40, "category": "Smartphones", "image": _local("products/comet-lite-smartphone.jpg"),
    },
    # --- Laptops ---
    {
        "name": "Nimbus Pro 14 Laptop",
        "description": "14-inch laptop, 16GB RAM, 512GB SSD, all-day battery life.",
        "price": 1488000, "compare_at_price": None, "sku": "NIM-PRO14",
        "stock_quantity": 12, "category": "Laptops", "image": _local("products/nimbus-pro-14-laptop.jpg"),
    },
    {
        "name": "Titan 15 Gaming Laptop",
        "description": "15.6-inch 144Hz display, RTX graphics, 32GB RAM, 1TB SSD.",
        "price": 3480000, "compare_at_price": 3840000, "sku": "TIT-G15",
        "stock_quantity": 6, "category": "Laptops", "image": _local("products/titan-15-gaming-laptop.jpg"),
    },
    {
        "name": "Slimline Air 13 Ultrabook",
        "description": "13-inch ultra-light 1.1kg laptop, 8GB RAM, 256GB SSD.",
        "price": 1152000, "compare_at_price": None, "sku": "SLM-AIR13",
        "stock_quantity": 15, "category": "Laptops", "image": _local("products/slimline-air-13-ultrabook.jpg"),
    },
    # --- Desktops ---
    {
        "name": "Vertex Tower i7 Desktop",
        "description": "Intel i7, 16GB RAM, 1TB SSD, dedicated graphics -- ready for work or play.",
        "price": 1872000, "compare_at_price": None, "sku": "VTX-I7",
        "stock_quantity": 8, "category": "Desktops", "image": _local("products/vertex-tower-i7-desktop.jpg"),
    },
    {
        "name": "Compact Mini PC",
        "description": "Space-saving mini desktop, 8GB RAM, 256GB SSD -- ideal for offices.",
        "price": 768000, "compare_at_price": 840000, "sku": "CMP-MINI",
        "stock_quantity": 20, "category": "Desktops", "image": _local("products/compact-mini-pc.jpg"),
    },
    {
        "name": "Workstation Pro X",
        "description": "High-performance workstation for design and video editing, 32GB RAM, 2TB SSD.",
        "price": 4440000, "compare_at_price": None, "sku": "WKS-PROX",
        "stock_quantity": 4, "category": "Desktops", "image": _local("products/workstation-pro-x.png"),
    },
    # --- GPS & Trackers ---
    {
        "name": "TrackSafe GPS Vehicle Tracker",
        "description": "Real-time GPS vehicle tracking with mobile app, geofencing, and theft alerts.",
        "price": 108000, "compare_at_price": None, "sku": "TRK-VEH01",
        "stock_quantity": 30, "category": "GPS & Trackers", "image": _local("products/tracksafe-gps-vehicle-tracker.jpg"),
    },
    {
        "name": "NaviPro Handheld GPS",
        "description": "Rugged handheld GPS navigator for outdoor and off-road use.",
        "price": 163000, "compare_at_price": 190000, "sku": "NAV-HAND01",
        "stock_quantity": 14, "category": "GPS & Trackers", "image": _local("products/navipro-handheld-gps.jpg"),
    },
    {
        "name": "FleetGuard Mini GPS Tracker",
        "description": "Compact GPS tracker for motorcycles and bikes, long battery life.",
        "price": 67000, "compare_at_price": None, "sku": "FLT-MINI01",
        "stock_quantity": 4, "category": "GPS & Trackers", "image": _local("products/fleetguard-mini-gps-tracker.jpg"),
    },
    # --- CCTV & Security Cameras (genuine Hikvision products) ---
    {
        "name": "Hikvision 4-Channel PoE NVR Kit",
        "description": "Genuine Hikvision 4-channel PoE NVR with matching HD cameras, night vision and remote mobile viewing.",
        "price": 396000, "compare_at_price": 468000, "sku": "SEC-4CH",
        "stock_quantity": 10, "category": "CCTV & Security Cameras", "image": _local("products/hikvision-4-channel-poe-nvr-kit.png"),
    },
    {
        "name": "Hikvision Outdoor Dome Network Camera",
        "description": "Genuine Hikvision PoE dome network camera, weatherproof housing, night vision, two-way audio.",
        "price": 77000, "compare_at_price": None, "sku": "NGT-WIP01",
        "stock_quantity": 22, "category": "CCTV & Security Cameras",
        "image": _local("products/hikvision-outdoor-dome-network-camera.jpg"),
    },
    {
        "name": "Hikvision TandemVu PTZ Camera",
        "description": "Genuine Hikvision TandemVu pan-tilt-zoom camera, combining panoramic and detail views with long-range night vision.",
        "price": 130000, "compare_at_price": None, "sku": "DOM-OUT01",
        "stock_quantity": 16, "category": "CCTV & Security Cameras", "image": _local("products/hikvision-tandemvu-ptz-camera.jpg"),
    },
    {
        "name": "Hikvision Video Intercom Doorbell",
        "description": "Genuine Hikvision video door intercom with camera and card access lock, two-way audio and mobile alerts.",
        "price": 98000, "compare_at_price": 115000, "sku": "SMT-DOOR01",
        "stock_quantity": 3, "category": "CCTV & Security Cameras",
        "image": _local("products/hikvision-video-intercom-doorbell.jpg"),
    },
    # --- Audio ---
    {
        "name": "Pulse Wireless Earbuds",
        "description": "Active noise cancellation, 30-hour battery with charging case.",
        "price": 91000, "compare_at_price": 108000, "sku": "PLS-EB01",
        "stock_quantity": 60, "category": "Audio", "image": _local("products/pulse-wireless-earbuds.jpg"),
    },
    {
        "name": "BassBoost Bluetooth Speaker",
        "description": "Portable waterproof Bluetooth speaker with deep bass and 12-hour battery.",
        "price": 62000, "compare_at_price": None, "sku": "BSB-SPK01",
        "stock_quantity": 35, "category": "Audio", "image": _local("products/bassboost-bluetooth-speaker.jpg"),
    },
    # --- Phone Accessories ---
    {
        "name": "VoltCharge 65W Fast Charger",
        "description": "Universal USB-C GaN fast charger, compatible with phones and laptops.",
        "price": 37000, "compare_at_price": None, "sku": "VLT-65W",
        "stock_quantity": 3, "category": "Phone Accessories", "image": _local("products/voltcharge-65w-fast-charger.jpg"),
    },
    {
        "name": "ArmorShield Phone Case",
        "description": "Military-grade drop protection case, available for major phone models.",
        "price": 20000, "compare_at_price": 29000, "sku": "ARM-CASE01",
        "stock_quantity": 80, "category": "Phone Accessories", "image": _local("products/armorshield-phone-case.jpg"),
    },
    {
        "name": "ClearView Tempered Glass Screen Protector",
        "description": "9H hardness tempered glass, bubble-free installation, 2-pack.",
        "price": 8000, "compare_at_price": None, "sku": "CLR-GLASS01",
        "stock_quantity": 120, "category": "Phone Accessories", "image": _local("products/clearview-tempered-glass-screen-protector.png"),
    },
    {
        "name": "FlexMount Car Phone Holder",
        "description": "360-degree rotating dashboard and vent phone mount.",
        "price": 15000, "compare_at_price": None, "sku": "FLX-MOUNT01",
        "stock_quantity": 5, "category": "Phone Accessories", "image": _local("products/flexmount-car-phone-holder.jpg"),
    },
    # --- Computer Accessories ---
    {
        "name": "ErgoType Wireless Keyboard & Mouse Combo",
        "description": "Comfortable wireless keyboard and mouse set, 18-month battery life.",
        "price": 53000, "compare_at_price": 62000, "sku": "ERG-COMBO01",
        "stock_quantity": 28, "category": "Computer Accessories", "image": _local("products/ergotype-wireless-keyboard-mouse-combo.jpg"),
    },
    {
        "name": "ClickPro Wireless Mouse",
        "description": "Precision wireless mouse with silent clicks and adjustable DPI.",
        "price": 23000, "compare_at_price": None, "sku": "CLK-MOUSE01",
        "stock_quantity": 45, "category": "Computer Accessories", "image": _local("products/viewmax-27-monitor.jpg"),
    },
    {
        "name": 'ViewMax 27" Monitor',
        "description": "27-inch Full HD IPS monitor, ideal for work and everyday computing.",
        "price": 348000, "compare_at_price": 396000, "sku": "VWM-27FHD",
        "stock_quantity": 9, "category": "Computer Accessories", "image": _local("products/clickpro-wireless-mouse.jpg"),
    },
    {
        "name": "SwiftHub USB-C Docking Station",
        "description": "9-in-1 USB-C hub with HDMI, USB 3.0, SD card reader, and PD charging.",
        "price": 66000, "compare_at_price": None, "sku": "SWF-HUB01",
        "stock_quantity": 17, "category": "Computer Accessories", "image": _local("products/swifthub-usb-c-docking-station.jpg"),
    },
    # --- Smartphones (Infinix / Tecno / Apple) ---
    {
        "name": "Infinix NOTE 60 Pro 5G, 8GB RAM, 256GB",
        "description": "6.78-inch display, 8GB RAM, 256GB storage, 5G connectivity.",
        "price": 1510000, "compare_at_price": 1950000, "sku": "INF-N60PRO",
        "stock_quantity": 12, "category": "Smartphones", "image": _local("products/infinix-note-edge-5g-256gb-8gb-ram-6-78.jpg"),
    },
    {
        "name": 'Infinix Note Edge 5G (256GB + 8GB RAM) 6.78"',
        "description": "6.78-inch display, 8GB RAM, 256GB storage, 5G connectivity.",
        "price": 1170000, "compare_at_price": 1500000, "sku": "INF-NEDGE5G",
        "stock_quantity": 14, "category": "Smartphones", "image": _local("products/infinix-note-60-pro-5g-8gb-ram-256gb.jpg"),
    },
    {
        "name": "Infinix Smart 20 (4GB RAM + 64GB Storage)",
        "description": "Budget-friendly display, 4GB RAM, 64GB storage.",
        "price": 429000, "compare_at_price": 450000, "sku": "INF-SMART20",
        "stock_quantity": 30, "category": "Smartphones", "image": _local("products/infinix-smart-20-4gb-ram-64gb-storage.jpg"),
    },
    {
        "name": "Tecno Spark Slim 6.78\" AMOLED 144Hz - Helio",
        "description": "6.78-inch AMOLED, 144Hz refresh rate, Helio chipset.",
        "price": 929000, "compare_at_price": 1200000, "sku": "TEC-SPARKSLIM",
        "stock_quantity": 10, "category": "Smartphones", "image": _local("products/tecno-spark-slim-6-78-amoled-144hz-helio.png"),
    },
    {
        "name": "Tecno Spark Go 2 64GB ROM + 4GB RAM - T7250",
        "description": "64GB storage, 4GB RAM, everyday performance chipset.",
        "price": 369000, "compare_at_price": 400000, "sku": "TEC-SPARKGO2",
        "stock_quantity": 20, "category": "Smartphones", "image": _local("products/tecno-spark-go-2-64gb-rom-4gb-ram-t7250.png"),
    },
    {
        "name": "Apple iPhone 17 Pro Max 1TB - A19 Pro Chip",
        "description": "1TB storage, A19 Pro chip, Apple's flagship camera system.",
        "price": 7600000, "compare_at_price": 7900000, "sku": "APL-17PM-1TB",
        "stock_quantity": 3, "category": "Smartphones", "image": _local("products/apple-iphone-17-pro-max-1tb-a19-pro-chip.jpg"),
    },
    {
        "name": "Apple iPhone 17 Pro Max 512GB - A19 Pro Chip",
        "description": "512GB storage, A19 Pro chip, Apple's flagship camera system.",
        "price": 6600000, "compare_at_price": 7200000, "sku": "APL-17PM-512",
        "stock_quantity": 5, "category": "Smartphones", "image": _local("products/tecno-megapad-se-11-tablet-4gb-ram.jpg"),
    },
    # --- Tablets ---
    {
        "name": 'Tecno MegaPad SE 11" Tablet - 4GB RAM',
        "description": "11-inch display, 4GB RAM, everyday tablet for work and entertainment.",
        "price": 629000, "compare_at_price": 650000, "sku": "TEC-MEGAPADSE",
        "stock_quantity": 8, "category": "Tablets", "image": _local("products/samsung-galaxy-tab-a11-8-7-inch-tablet.jpg"),
    },
    {
        "name": 'Samsung Galaxy Tab A11 8.7-Inch Tablet',
        "description": "8.7-inch display, everyday tablet for browsing, media and study.",
        "price": 750000, "compare_at_price": 800000, "sku": "SAM-TABA11",
        "stock_quantity": 15, "category": "Tablets", "image": _local("products/apple-iphone-17-pro-max-512gb-a19-pro-chip.jpg"),
    },
    {
        "name": "Apple iPad Pro 11-inch M4 Wi-Fi + 5G Cellular",
        "description": "11-inch iPad Pro, M4 chip, Wi-Fi + 5G Cellular.",
        "price": 4600000, "compare_at_price": 4900000, "sku": "APL-IPADPRO11M4",
        "stock_quantity": 4, "category": "Tablets", "image": _local("products/apple-ipad-pro-11-inch-m4-wi-fi-5g-cellular.jpg"),
    },
    {
        "name": "Apple iPad Air M3 13-inch Wi-Fi + 5G Cellular",
        "description": "13-inch iPad Air, M3 chip, Wi-Fi + 5G Cellular.",
        "price": 3050000, "compare_at_price": 3250000, "sku": "APL-IPADAIRM3-13",
        "stock_quantity": 5, "category": "Tablets", "image": _local("products/apple-ipad-air-m3-13-inch-wi-fi-5g-cellular.jpg"),
    },
    {
        "name": "Apple iPad Air M3 11-inch Wi-Fi + 5G Cellular",
        "description": "11-inch iPad Air, M3 chip, Wi-Fi + 5G Cellular.",
        "price": 3400000, "compare_at_price": 3600000, "sku": "APL-IPADAIRM3-11",
        "stock_quantity": 6, "category": "Tablets", "image": _local("products/tecno-t403-dual-sim-2-4-display-4mb-ram-4mb.jpg"),
    },
    # --- Feature Phones (Tecno T-series) ---
    {
        "name": 'Tecno T403 Dual SIM 2.4" Display - 4MB RAM, 4MB',
        "description": "2.4-inch display, dual SIM, stylish metal design.",
        "price": 75000, "compare_at_price": 85000, "sku": "TEC-T403",
        "stock_quantity": 25, "category": "Feature Phones", "image": _local("products/tecno-t313-dual-sim-1-77-display-4mb.jpg"),
    },
    {
        "name": 'Tecno T313 Dual SIM 1.77" Display - 4MB',
        "description": "1.77-inch display, dual SIM, long standby battery.",
        "price": 80000, "compare_at_price": 96000, "sku": "TEC-T313",
        "stock_quantity": 25, "category": "Feature Phones", "image": _local("products/tecno-t315-dual-sim-2-4-qqvga-display-4mb.jpg"),
    },
    {
        "name": 'Tecno T315 Dual SIM 2.4" QQVGA Display - 4MB',
        "description": "2.4-inch QQVGA display, dual SIM.",
        "price": 80000, "compare_at_price": 95000, "sku": "TEC-T315",
        "stock_quantity": 25, "category": "Feature Phones", "image": _local("products/tecno-t353-dual-sim-2-4-qqvga-display-4mb.jpg"),
    },
    {
        "name": 'Tecno T353 Dual SIM 2.4" QQVGA Display - 4MB',
        "description": "2.4-inch QQVGA display, dual SIM.",
        "price": 90000, "compare_at_price": 100000, "sku": "TEC-T353",
        "stock_quantity": 20, "category": "Feature Phones", "image": _local("products/tecno-t352-dual-sim-1-77-display-4mb.jpg"),
    },
    {
        "name": 'Tecno T352 Dual SIM 1.77" Display - 4MB',
        "description": "1.77-inch display, dual SIM.",
        "price": 65000, "compare_at_price": 75000, "sku": "TEC-T352",
        "stock_quantity": 20, "category": "Feature Phones", "image": _local("products/tecno-t485-dual-sim-2-8-display-4mb-ram-4mb.jpg"),
    },
    {
        "name": 'Tecno T485 Dual SIM 2.8" Display - 4MB RAM, 4MB',
        "description": "2.8-inch display, dual SIM.",
        "price": 140000, "compare_at_price": 190000, "sku": "TEC-T485",
        "stock_quantity": 15, "category": "Feature Phones", "image": _local("products/tecno-t529-dual-sim-2-8-display-16mb-rom.jpg"),
    },
    {
        "name": 'Tecno T529 Dual SIM 2.8" Display - 16MB ROM',
        "description": "2.8-inch display, dual SIM, 16MB ROM.",
        "price": 95000, "compare_at_price": 105000, "sku": "TEC-T529",
        "stock_quantity": 18, "category": "Feature Phones", "image": _local("products/tecno-t663-dual-sim-3-5-touchscreen-128mb.jpg"),
    },
    {
        "name": 'Tecno T663 Dual SIM 3.5" Touchscreen - 128MB',
        "description": "3.5-inch touchscreen, dual SIM, 128MB storage.",
        "price": 135000, "compare_at_price": 150000, "sku": "TEC-T663",
        "stock_quantity": 12, "category": "Feature Phones", "image": _local("products/tecno-t455-dual-sim-2-8-display-128mb-rom.jpg"),
    },
    {
        "name": 'Tecno T455 Dual SIM 2.8" Display, 128MB ROM',
        "description": "2.8-inch display, dual SIM, 128MB ROM.",
        "price": 95000, "compare_at_price": 105000, "sku": "TEC-T455",
        "stock_quantity": 18, "category": "Feature Phones", "image": _local("products/lenovo-thinkcentre-neo-50a-gen-5-27-all-in-one.jpg"),
    },
    # --- Laptops & Desktops (Lenovo / HP / Dell) ---
    {
        "name": 'Lenovo ThinkCentre Neo 50a Gen 5 27" All-in-One',
        "description": "27-inch all-in-one desktop PC.",
        "price": 4023000, "compare_at_price": 4300000, "sku": "LEN-TCN50A-G5-27",
        "stock_quantity": 6, "category": "Desktops", "image": _local("products/lenovo-thinkcentre-neo-50a-gen-5-24-fhd-all-in-one.jpg"),
    },
    {
        "name": 'Lenovo IdeaPad Slim 3 14AMN8 14" Laptop',
        "description": "14-inch everyday laptop.",
        "price": 2185000, "compare_at_price": 2300000, "sku": "LEN-IPS3-14AMN8",
        "stock_quantity": 10, "category": "Laptops", "image": _local("products/lenovo-ideapad-slim-3-14amn8-14-laptop.jpg"),
    },
    {
        "name": 'HP ProBook 4 G1iR 16" Laptop | Intel Core 5',
        "description": "16-inch business laptop, Intel Core 5.",
        "price": 3776000, "compare_at_price": 4000000, "sku": "HP-PB4-G1IR-16",
        "stock_quantity": 8, "category": "Laptops", "image": _local("products/hp-probook-4-g1ir-16-laptop-intel-core-5.jpg"),
    },
    {
        "name": 'HP ProBook 4 G1iR 14" Laptop Intel Core 5 120U',
        "description": "14-inch business laptop, Intel Core 5 120U.",
        "price": 3776000, "compare_at_price": 4000000, "sku": "HP-PB4-G1IR-14",
        "stock_quantity": 8, "category": "Laptops", "image": _local("products/hp-probook-4-g1ir-14-laptop-intel-core-5-120u.jpg"),
    },
    {
        "name": 'HP ProBook 4 G1i 16" WUXGA Laptop | Intel',
        "description": "16-inch WUXGA business laptop.",
        "price": 4023000, "compare_at_price": 4300000, "sku": "HP-PB4-G1I-16",
        "stock_quantity": 6, "category": "Laptops", "image": _local("products/hp-probook-4-g1i-16-wuxga-laptop-intel.jpg"),
    },
    {
        "name": 'Lenovo ThinkCentre Neo 50a Gen 5 24" FHD All-in-One',
        "description": "24-inch FHD all-in-one desktop PC.",
        "price": 3867000, "compare_at_price": 4000000, "sku": "LEN-TCN50A-G5-24",
        "stock_quantity": 7, "category": "Desktops", "image": _local("products/lenovo-thinkcentre-neo-50a-gen-5-24-fhd-multi-touch.jpg"),
    },
    {
        "name": 'Lenovo ThinkCentre Neo 50a Gen 5 24" FHD Multi-touch',
        "description": "24-inch FHD multi-touch all-in-one desktop PC.",
        "price": 4000000, "compare_at_price": 4300000, "sku": "LEN-TCN50A-G5-24MT",
        "stock_quantity": 5, "category": "Desktops", "image": _local("products/apple-ipad-air-m3-11-inch-wi-fi-5g-cellular.jpg"),
    },
    {
        "name": "HP OMEN Transcend 14 Voco 25C1 Intel Core",
        "description": "14-inch gaming laptop, Intel Core.",
        "price": 9068000, "compare_at_price": 9250000, "sku": "HP-OMEN-TRANS14",
        "stock_quantity": 3, "category": "Laptops", "image": _local("products/hp-omen-transcend-14-voco-25c1-intel-core.jpg"),
    },
    {
        "name": "HP OMEN Hanna 16 Gaming Laptop Intel",
        "description": "16-inch gaming laptop, Intel.",
        "price": 11535000, "compare_at_price": 12000000, "sku": "HP-OMEN-HANNA16",
        "stock_quantity": 2, "category": "Laptops", "image": _local("products/hp-omen-hanna-16-gaming-laptop-intel.jpg"),
    },
    {
        "name": "HP HyperX OMEN 15-ga0005TX Gaming",
        "description": "15-inch gaming laptop, HyperX edition.",
        "price": 8844000, "compare_at_price": 9000000, "sku": "HP-OMEN-15GA0005TX",
        "stock_quantity": 3, "category": "Laptops", "image": _local("products/hp-hyperx-omen-15-ga0005tx-gaming.jpg"),
    },
    {
        "name": 'Lenovo ThinkCentre Neo 50a Gen 6 24" All-in-One',
        "description": "24-inch all-in-one desktop PC, Gen 6.",
        "price": 5000000, "compare_at_price": 5500000, "sku": "LEN-TCN50A-G6-24A",
        "stock_quantity": 6, "category": "Desktops", "image": _local("products/lenovo-thinkcentre-neo-50a-gen-6-24-all-in-one.jpg"),
    },
    {
        "name": 'Lenovo ThinkCentre Neo 50a Gen 6 27" All-in-One',
        "description": "27-inch all-in-one desktop PC, Gen 6.",
        "price": 4800000, "compare_at_price": 5000000, "sku": "LEN-TCN50A-G6-27A",
        "stock_quantity": 5, "category": "Desktops", "image": _local("products/lenovo-thinkcentre-neo-50a-gen-6-27-all-in-one.jpg"),
    },
    {
        "name": "HP Laptop 15-fd1126nia Intel Core Ultra 5 125H",
        "description": "15-inch laptop, Intel Core Ultra 5 125H.",
        "price": 3104000, "compare_at_price": 3200000, "sku": "HP-15FD1126NIA",
        "stock_quantity": 10, "category": "Laptops", "image": _local("products/hp-laptop-15-fd1126nia-intel-core-ultra-5-125h.png"),
    },
    {
        "name": "Lenovo ThinkCentre Neo 50t Gen 6 Desktop - Intel",
        "description": "Tower desktop PC, Gen 6, Intel.",
        "price": 3570000, "compare_at_price": 3800000, "sku": "LEN-TCN50T-G6",
        "stock_quantity": 6, "category": "Desktops", "image": _local("products/lenovo-thinkcentre-neo-50t-gen-6-desktop-intel.jpg"),
    },
    {
        "name": "Dell Pro Tower Essential QVT1260 Desktop PC",
        "description": "Tower desktop PC.",
        "price": 3485000, "compare_at_price": 3800000, "sku": "DELL-QVT1260-A",
        "stock_quantity": 7, "category": "Desktops", "image": _local("products/dell-pro-tower-essential-qvt1260-desktop-pc.jpg"),
    },
    {
        "name": "Dell Pro Tower Essential QVT1260 Desktop PC (B)",
        "description": "Tower desktop PC.",
        "price": 3194000, "compare_at_price": 3500000, "sku": "DELL-QVT1260-B",
        "stock_quantity": 7, "category": "Desktops", "image": _local("products/dell-pro-tower-essential-qvt1260-desktop-pc-b.jpg"),
    },
    {
        "name": "Dell Pro 15 PV15250 Laptop | Intel Core 3",
        "description": "15-inch laptop, Intel Core 3.",
        "price": 2342000, "compare_at_price": 2400000, "sku": "DELL-PV15250",
        "stock_quantity": 9, "category": "Laptops", "image": _local("products/dell-pro-15-pv15250-laptop-intel-core-3.png"),
    },
    {
        "name": 'Lenovo IdeaPad Slim 3 14AMN8 14" FHD Laptop',
        "description": "14-inch FHD everyday laptop.",
        "price": 2185000, "compare_at_price": 2500000, "sku": "LEN-IPS3-14AMN8-FHD",
        "stock_quantity": 10, "category": "Laptops", "image": _local("products/lenovo-ideapad-slim-3-14amn8-14-fhd-laptop.jpg"),
    },
    # --- Networking ---
    {
        "name": "ASUS TUF Gaming Wi-Fi Router",
        "description": "High-performance dual-band Wi-Fi router with multiple external antennas for wide coverage.",
        "price": 320000, "compare_at_price": None, "sku": "ASUS-TUF-ROUTER",
        "stock_quantity": 10, "category": "Networking", "image": _local("products/asus-tuf-gaming-wi-fi-router.jpg"),
    },
    # --- Installation & Services ---
    {
        "name": "CCTV Installation Service (Per Camera)",
        "description": "Professional installation, cable routing, and setup for one CCTV camera, including basic configuration and mobile app connection.",
        "price": 50000, "compare_at_price": None, "sku": "SVC-CCTV-INSTALL",
        "stock_quantity": 999, "category": "Installation & Services",
        "image": _local("products/cctv-installation-service-per-camera.jpg"),
    },
    {
        "name": "GPS Tracker Installation & Activation",
        "description": "Professional fitting of a vehicle or asset GPS tracker, SIM activation, and mobile app setup.",
        "price": 30000, "compare_at_price": None, "sku": "SVC-GPS-INSTALL",
        "stock_quantity": 999, "category": "Installation & Services", "image": _local("products/gps-tracker-installation-activation.jpg"),
    },
    {
        "name": "Laptop/Computer Setup & Software Installation",
        "description": "Operating system setup, essential software installation, and data transfer for a new laptop or desktop.",
        "price": 25000, "compare_at_price": None, "sku": "SVC-PC-SETUP",
        "stock_quantity": 999, "category": "Installation & Services", "image": _local("products/laptop-computer-setup-software-installation.jpg"),
    },
    {
        "name": "Home/Office Wi-Fi Network Setup",
        "description": "Router installation, Wi-Fi configuration, and network optimization for your home or office.",
        "price": 80000, "compare_at_price": None, "sku": "SVC-NETWORK-SETUP",
        "stock_quantity": 999, "category": "Installation & Services", "image": _local("products/home-office-wi-fi-network-setup.jpg"),
    },
]


async def seed() -> None:
    async with AsyncSessionLocal() as db:
        admin = (
            await db.execute(select(User).where(User.email == settings.SEED_ADMIN_EMAIL))
        ).scalar_one_or_none()
        if admin is None:
            admin = User(
                email=settings.SEED_ADMIN_EMAIL,
                hashed_password=hash_password(settings.SEED_ADMIN_PASSWORD),
                full_name="Francis Admin",
                role=UserRole.ADMIN,
            )
            db.add(admin)
            print(f"Created admin user: {settings.SEED_ADMIN_EMAIL}")
        else:
            print("Admin user already exists, skipping.")

        categories_by_name: dict[str, Category] = {}
        for name in SAMPLE_CATEGORIES:
            category = (await db.execute(select(Category).where(Category.name == name))).scalar_one_or_none()
            if category is None:
                slug = await generate_unique_slug(db, Category, name)
                category = Category(name=name, slug=slug)
                db.add(category)
                await db.flush()
                print(f"Created category: {name}")
            categories_by_name[name] = category

        created_count = 0
        updated_image_count = 0
        updated_price_count = 0
        updated_text_count = 0
        for item in SAMPLE_PRODUCTS:
            existing = (await db.execute(select(Product).where(Product.sku == item["sku"]))).scalar_one_or_none()
            if existing is not None:
                image = (
                    await db.execute(
                        select(ProductImage).where(ProductImage.product_id == existing.id, ProductImage.position == 0)
                    )
                ).scalar_one_or_none()
                if image is not None and image.url != item["image"]:
                    image.url = item["image"]
                    image.alt_text = item["name"]
                    updated_image_count += 1
                if existing.price != item["price"] or existing.compare_at_price != item["compare_at_price"]:
                    existing.price = item["price"]
                    existing.compare_at_price = item["compare_at_price"]
                    updated_price_count += 1
                if existing.name != item["name"] or existing.description != item["description"]:
                    existing.name = item["name"]
                    existing.description = item["description"]
                    existing.slug = await generate_unique_slug(db, Product, item["name"], exclude_id=existing.id)
                    updated_text_count += 1
                correct_category_id = categories_by_name[item["category"]].id
                if existing.category_id != correct_category_id:
                    existing.category_id = correct_category_id
                continue
            slug = await generate_unique_slug(db, Product, item["name"])
            product = Product(
                name=item["name"],
                slug=slug,
                description=item["description"],
                price=item["price"],
                compare_at_price=item["compare_at_price"],
                sku=item["sku"],
                stock_quantity=item["stock_quantity"],
                category_id=categories_by_name[item["category"]].id,
            )
            db.add(product)
            await db.flush()
            db.add(ProductImage(product_id=product.id, url=item["image"], alt_text=item["name"], position=0))
            print(f"Created product: {item['name']}")
            created_count += 1

        await db.commit()
    print(
        f"Seeding complete. {created_count} new product(s) created, "
        f"{updated_image_count} image(s) updated, {updated_price_count} price(s) updated, "
        f"{updated_text_count} name/description update(s)."
    )


if __name__ == "__main__":
    asyncio.run(seed())
