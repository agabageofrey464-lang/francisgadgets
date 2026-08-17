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
]


def _wiki(filename: str) -> str:
    # Real product/reference photos from Wikimedia Commons, individually
    # verified (fetched and visually reviewed) to actually show the right
    # kind of product before being used here.
    return f"https://commons.wikimedia.org/wiki/Special:FilePath/{quote(filename)}?width=500"


def _unsplash(photo_id: str) -> str:
    return f"https://images.unsplash.com/photo-{photo_id}?w=800"


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
        "stock_quantity": 25, "category": "Smartphones", "image": _unsplash("1511707171634-5f897ff02aa9"),
    },
    {
        "name": "Zenith S9 Smartphone",
        "description": "6.7-inch OLED, 256GB storage, 5G, 108MP main camera.",
        "price": 924000, "compare_at_price": None, "sku": "ZEN-S9",
        "stock_quantity": 18, "category": "Smartphones", "image": _unsplash("1511707171634-5f897ff02aa9"),
    },
    {
        "name": "Comet Lite Smartphone",
        "description": "Budget-friendly 6.1-inch display, 64GB storage, all-day battery.",
        "price": 235000, "compare_at_price": 276000, "sku": "COM-LITE",
        "stock_quantity": 40, "category": "Smartphones", "image": _unsplash("1511707171634-5f897ff02aa9"),
    },
    # --- Laptops ---
    {
        "name": "Nimbus Pro 14 Laptop",
        "description": "14-inch laptop, 16GB RAM, 512GB SSD, all-day battery life.",
        "price": 1488000, "compare_at_price": None, "sku": "NIM-PRO14",
        "stock_quantity": 12, "category": "Laptops", "image": _unsplash("1496181133206-80ce9b88a853"),
    },
    {
        "name": "Titan 15 Gaming Laptop",
        "description": "15.6-inch 144Hz display, RTX graphics, 32GB RAM, 1TB SSD.",
        "price": 3480000, "compare_at_price": 3840000, "sku": "TIT-G15",
        "stock_quantity": 6, "category": "Laptops", "image": _wiki("MSI_Gaming_Laptop_on_wood_floor.jpg"),
    },
    {
        "name": "Slimline Air 13 Ultrabook",
        "description": "13-inch ultra-light 1.1kg laptop, 8GB RAM, 256GB SSD.",
        "price": 1152000, "compare_at_price": None, "sku": "SLM-AIR13",
        "stock_quantity": 15, "category": "Laptops", "image": _wiki("Schenker_VIA14_Laptop_asv2021-01.jpg"),
    },
    # --- Desktops ---
    {
        "name": "Vertex Tower i7 Desktop",
        "description": "Intel i7, 16GB RAM, 1TB SSD, dedicated graphics -- ready for work or play.",
        "price": 1872000, "compare_at_price": None, "sku": "VTX-I7",
        "stock_quantity": 8, "category": "Desktops", "image": _wiki("Computer_case_-_Full_Tower.jpg"),
    },
    {
        "name": "Compact Mini PC",
        "description": "Space-saving mini desktop, 8GB RAM, 256GB SSD -- ideal for offices.",
        "price": 768000, "compare_at_price": 840000, "sku": "CMP-MINI",
        "stock_quantity": 20, "category": "Desktops", "image": _wiki("Antec_ISK110_mini-PC_side.JPG"),
    },
    {
        "name": "Workstation Pro X",
        "description": "High-performance workstation for design and video editing, 32GB RAM, 2TB SSD.",
        "price": 4440000, "compare_at_price": None, "sku": "WKS-PROX",
        "stock_quantity": 4, "category": "Desktops", "image": _wiki("Falcon_Northwest_Mach_V_full_tower_desktop_PC.png"),
    },
    # --- GPS & Trackers ---
    {
        "name": "TrackSafe GPS Vehicle Tracker",
        "description": "Real-time GPS vehicle tracking with mobile app, geofencing, and theft alerts.",
        "price": 108000, "compare_at_price": None, "sku": "TRK-VEH01",
        "stock_quantity": 30, "category": "GPS & Trackers", "image": _wiki("Gps_tracking_device_for_fleet_management.png"),
    },
    {
        "name": "NaviPro Handheld GPS",
        "description": "Rugged handheld GPS navigator for outdoor and off-road use.",
        "price": 163000, "compare_at_price": 190000, "sku": "NAV-HAND01",
        "stock_quantity": 14, "category": "GPS & Trackers", "image": _wiki("Garmin_Etrex_H_7262.jpg"),
    },
    {
        "name": "FleetGuard Mini GPS Tracker",
        "description": "Compact GPS tracker for motorcycles and bikes, long battery life.",
        "price": 67000, "compare_at_price": None, "sku": "FLT-MINI01",
        "stock_quantity": 4, "category": "GPS & Trackers", "image": _wiki("DG-Tracker_Smile,_GPS_Vehicle_Tracker.jpg"),
    },
    # --- CCTV & Security Cameras (genuine Hikvision products) ---
    {
        "name": "Hikvision 4-Channel PoE NVR Kit",
        "description": "Genuine Hikvision 4-channel PoE NVR with matching HD cameras, night vision and remote mobile viewing.",
        "price": 396000, "compare_at_price": 468000, "sku": "SEC-4CH",
        "stock_quantity": 10, "category": "CCTV & Security Cameras", "image": _wiki("CCTV_Cameras.png"),
    },
    {
        "name": "Hikvision Outdoor Dome Network Camera",
        "description": "Genuine Hikvision PoE dome network camera, weatherproof housing, night vision, two-way audio.",
        "price": 77000, "compare_at_price": None, "sku": "NGT-WIP01",
        "stock_quantity": 22, "category": "CCTV & Security Cameras",
        "image": _wiki("Hikvision @ P+R Étoile @ Carouge (50514011831).jpg"),
    },
    {
        "name": "Hikvision TandemVu PTZ Camera",
        "description": "Genuine Hikvision TandemVu pan-tilt-zoom camera, combining panoramic and detail views with long-range night vision.",
        "price": 130000, "compare_at_price": None, "sku": "DOM-OUT01",
        "stock_quantity": 16, "category": "CCTV & Security Cameras", "image": _wiki("DS-2TD95C8-300ZK2FL.jpg"),
    },
    {
        "name": "Hikvision Video Intercom Doorbell",
        "description": "Genuine Hikvision video door intercom with camera and card access lock, two-way audio and mobile alerts.",
        "price": 98000, "compare_at_price": 115000, "sku": "SMT-DOOR01",
        "stock_quantity": 3, "category": "CCTV & Security Cameras",
        "image": _wiki("Hikvision doorbell with a camera and card lock, Gouda (2020) 01.jpg"),
    },
    # --- Audio ---
    {
        "name": "Pulse Wireless Earbuds",
        "description": "Active noise cancellation, 30-hour battery with charging case.",
        "price": 91000, "compare_at_price": 108000, "sku": "PLS-EB01",
        "stock_quantity": 60, "category": "Audio", "image": _unsplash("1590658268037-6bf12165a8df"),
    },
    {
        "name": "BassBoost Bluetooth Speaker",
        "description": "Portable waterproof Bluetooth speaker with deep bass and 12-hour battery.",
        "price": 62000, "compare_at_price": None, "sku": "BSB-SPK01",
        "stock_quantity": 35, "category": "Audio", "image": _wiki("UE_Boom_speakers.jpg"),
    },
    # --- Phone Accessories ---
    {
        "name": "VoltCharge 65W Fast Charger",
        "description": "Universal USB-C GaN fast charger, compatible with phones and laptops.",
        "price": 37000, "compare_at_price": None, "sku": "VLT-65W",
        "stock_quantity": 3, "category": "Phone Accessories", "image": _unsplash("1583863788434-e58a36330cf0"),
    },
    {
        "name": "ArmorShield Phone Case",
        "description": "Military-grade drop protection case, available for major phone models.",
        "price": 20000, "compare_at_price": 29000, "sku": "ARM-CASE01",
        "stock_quantity": 80, "category": "Phone Accessories", "image": _wiki("Protective_phone_case_for_OnePlus_Nord.jpg"),
    },
    {
        "name": "ClearView Tempered Glass Screen Protector",
        "description": "9H hardness tempered glass, bubble-free installation, 2-pack.",
        "price": 8000, "compare_at_price": None, "sku": "CLR-GLASS01",
        "stock_quantity": 120, "category": "Phone Accessories", "image": _wiki("Screen_protector.png"),
    },
    {
        "name": "FlexMount Car Phone Holder",
        "description": "360-degree rotating dashboard and vent phone mount.",
        "price": 15000, "compare_at_price": None, "sku": "FLX-MOUNT01",
        "stock_quantity": 5, "category": "Phone Accessories", "image": _wiki("Smartphone_mounted_on_car_dashboard_during_a_drive_in_a_modern_vehicle_with_a_focus_on_navigation_use.jpg"),
    },
    # --- Computer Accessories ---
    {
        "name": "ErgoType Wireless Keyboard & Mouse Combo",
        "description": "Comfortable wireless keyboard and mouse set, 18-month battery life.",
        "price": 53000, "compare_at_price": 62000, "sku": "ERG-COMBO01",
        "stock_quantity": 28, "category": "Computer Accessories", "image": _wiki("Wireless_computer_keyboard_with_mouse_an_USB_receiver.jpg"),
    },
    {
        "name": "ClickPro Wireless Mouse",
        "description": "Precision wireless mouse with silent clicks and adjustable DPI.",
        "price": 23000, "compare_at_price": None, "sku": "CLK-MOUSE01",
        "stock_quantity": 45, "category": "Computer Accessories", "image": _wiki("2023_Mysz_komputerowa_Logitech_G903_Lightspeed.jpg"),
    },
    {
        "name": 'ViewMax 27" Monitor',
        "description": "27-inch Full HD IPS monitor, ideal for work and everyday computing.",
        "price": 348000, "compare_at_price": 396000, "sku": "VWM-27FHD",
        "stock_quantity": 9, "category": "Computer Accessories", "image": _wiki("Monitor_of_mac.jpg"),
    },
    {
        "name": "SwiftHub USB-C Docking Station",
        "description": "9-in-1 USB-C hub with HDMI, USB 3.0, SD card reader, and PD charging.",
        "price": 66000, "compare_at_price": None, "sku": "SWF-HUB01",
        "stock_quantity": 17, "category": "Computer Accessories", "image": _wiki("USB-C_Digital_AV_Multiport_Adapter.jpeg"),
    },
    # --- Smartphones (Infinix / Tecno / Apple) ---
    {
        "name": "Infinix NOTE 60 Pro 5G, 8GB RAM, 256GB",
        "description": "6.78-inch display, 8GB RAM, 256GB storage, 5G connectivity.",
        "price": 1510000, "compare_at_price": 1950000, "sku": "INF-N60PRO",
        "stock_quantity": 12, "category": "Smartphones", "image": _wiki("Infinix Note 50 Pro 4G.jpg"),
    },
    {
        "name": 'Infinix Note Edge 5G (256GB + 8GB RAM) 6.78"',
        "description": "6.78-inch display, 8GB RAM, 256GB storage, 5G connectivity.",
        "price": 1170000, "compare_at_price": 1500000, "sku": "INF-NEDGE5G",
        "stock_quantity": 14, "category": "Smartphones", "image": _wiki("Infinix Note 50 Pro 4G.jpg"),
    },
    {
        "name": "Infinix Smart 20 (4GB RAM + 64GB Storage)",
        "description": "Budget-friendly display, 4GB RAM, 64GB storage.",
        "price": 429000, "compare_at_price": 450000, "sku": "INF-SMART20",
        "stock_quantity": 30, "category": "Smartphones", "image": _wiki("Infinix Smart 4 Plus.jpg"),
    },
    {
        "name": "Tecno Spark Slim 6.78\" AMOLED 144Hz - Helio",
        "description": "6.78-inch AMOLED, 144Hz refresh rate, Helio chipset.",
        "price": 929000, "compare_at_price": 1200000, "sku": "TEC-SPARKSLIM",
        "stock_quantity": 10, "category": "Smartphones", "image": _wiki("Tecno Spark 20.jpg"),
    },
    {
        "name": "Tecno Spark Go 2 64GB ROM + 4GB RAM - T7250",
        "description": "64GB storage, 4GB RAM, everyday performance chipset.",
        "price": 369000, "compare_at_price": 400000, "sku": "TEC-SPARKGO2",
        "stock_quantity": 20, "category": "Smartphones", "image": _wiki("Tecno Spark 20.jpg"),
    },
    {
        "name": "Apple iPhone 17 Pro Max 1TB - A19 Pro Chip",
        "description": "1TB storage, A19 Pro chip, Apple's flagship camera system.",
        "price": 7600000, "compare_at_price": 7900000, "sku": "APL-17PM-1TB",
        "stock_quantity": 3, "category": "Smartphones", "image": _wiki("IPhone 17 Pro Max.jpg"),
    },
    {
        "name": "Apple iPhone 17 Pro Max 512GB - A19 Pro Chip",
        "description": "512GB storage, A19 Pro chip, Apple's flagship camera system.",
        "price": 6600000, "compare_at_price": 7200000, "sku": "APL-17PM-512",
        "stock_quantity": 5, "category": "Smartphones", "image": _wiki("IPhone 17 Pro Max.jpg"),
    },
    # --- Tablets ---
    {
        "name": 'Tecno MegaPad SE 11" Tablet - 4GB RAM',
        "description": "11-inch display, 4GB RAM, everyday tablet for work and entertainment.",
        "price": 629000, "compare_at_price": 650000, "sku": "TEC-MEGAPADSE",
        "stock_quantity": 8, "category": "Tablets", "image": _placeholder("Tecno MegaPad SE 11 Tablet"),
    },
    {
        "name": 'Samsung Galaxy Tab A11 8.7-Inch Tablet',
        "description": "8.7-inch display, everyday tablet for browsing, media and study.",
        "price": 750000, "compare_at_price": 800000, "sku": "SAM-TABA11",
        "stock_quantity": 15, "category": "Tablets", "image": _wiki("Samsung Galaxy Tab S8 Ultra.jpg"),
    },
    {
        "name": "Apple iPad Pro 11-inch M4 Wi-Fi + 5G Cellular",
        "description": "11-inch iPad Pro, M4 chip, Wi-Fi + 5G Cellular.",
        "price": 4600000, "compare_at_price": 4900000, "sku": "APL-IPADPRO11M4",
        "stock_quantity": 4, "category": "Tablets", "image": _wiki("Apple iPad Pro 11.jpg"),
    },
    {
        "name": "Apple iPad Air M3 13-inch Wi-Fi + 5G Cellular",
        "description": "13-inch iPad Air, M3 chip, Wi-Fi + 5G Cellular.",
        "price": 3050000, "compare_at_price": 3250000, "sku": "APL-IPADAIRM3-13",
        "stock_quantity": 5, "category": "Tablets", "image": _wiki("IPad Air 11-inch (M3).jpg"),
    },
    {
        "name": "Apple iPad Air M3 11-inch Wi-Fi + 5G Cellular",
        "description": "11-inch iPad Air, M3 chip, Wi-Fi + 5G Cellular.",
        "price": 3400000, "compare_at_price": 3600000, "sku": "APL-IPADAIRM3-11",
        "stock_quantity": 6, "category": "Tablets", "image": _wiki("IPad Air 11-inch (M3).jpg"),
    },
    # --- Feature Phones (Tecno T-series) ---
    {
        "name": 'Tecno T403 Dual SIM 2.4" Display - 4MB RAM, 4MB',
        "description": "2.4-inch display, dual SIM, stylish metal design.",
        "price": 75000, "compare_at_price": 85000, "sku": "TEC-T403",
        "stock_quantity": 25, "category": "Feature Phones", "image": _placeholder("Tecno T403"),
    },
    {
        "name": 'Tecno T313 Dual SIM 1.77" Display - 4MB',
        "description": "1.77-inch display, dual SIM, long standby battery.",
        "price": 80000, "compare_at_price": 96000, "sku": "TEC-T313",
        "stock_quantity": 25, "category": "Feature Phones", "image": _placeholder("Tecno T313"),
    },
    {
        "name": 'Tecno T315 Dual SIM 2.4" QQVGA Display - 4MB',
        "description": "2.4-inch QQVGA display, dual SIM.",
        "price": 80000, "compare_at_price": 95000, "sku": "TEC-T315",
        "stock_quantity": 25, "category": "Feature Phones", "image": _placeholder("Tecno T315"),
    },
    {
        "name": 'Tecno T353 Dual SIM 2.4" QQVGA Display - 4MB',
        "description": "2.4-inch QQVGA display, dual SIM.",
        "price": 90000, "compare_at_price": 100000, "sku": "TEC-T353",
        "stock_quantity": 20, "category": "Feature Phones", "image": _placeholder("Tecno T353"),
    },
    {
        "name": 'Tecno T352 Dual SIM 1.77" Display - 4MB',
        "description": "1.77-inch display, dual SIM.",
        "price": 65000, "compare_at_price": 75000, "sku": "TEC-T352",
        "stock_quantity": 20, "category": "Feature Phones", "image": _placeholder("Tecno T352"),
    },
    {
        "name": 'Tecno T485 Dual SIM 2.8" Display - 4MB RAM, 4MB',
        "description": "2.8-inch display, dual SIM.",
        "price": 140000, "compare_at_price": 190000, "sku": "TEC-T485",
        "stock_quantity": 15, "category": "Feature Phones", "image": _placeholder("Tecno T485"),
    },
    {
        "name": 'Tecno T529 Dual SIM 2.8" Display - 16MB ROM',
        "description": "2.8-inch display, dual SIM, 16MB ROM.",
        "price": 95000, "compare_at_price": 105000, "sku": "TEC-T529",
        "stock_quantity": 18, "category": "Feature Phones", "image": _placeholder("Tecno T529"),
    },
    {
        "name": 'Tecno T663 Dual SIM 3.5" Touchscreen - 128MB',
        "description": "3.5-inch touchscreen, dual SIM, 128MB storage.",
        "price": 135000, "compare_at_price": 150000, "sku": "TEC-T663",
        "stock_quantity": 12, "category": "Feature Phones", "image": _placeholder("Tecno T663"),
    },
    {
        "name": 'Tecno T455 Dual SIM 2.8" Display, 128MB ROM',
        "description": "2.8-inch display, dual SIM, 128MB ROM.",
        "price": 95000, "compare_at_price": 105000, "sku": "TEC-T455",
        "stock_quantity": 18, "category": "Feature Phones", "image": _placeholder("Tecno T455"),
    },
    # --- Laptops & Desktops (Lenovo / HP / Dell) ---
    {
        "name": 'Lenovo ThinkCentre Neo 50a Gen 5 27" All-in-One',
        "description": "27-inch all-in-one desktop PC.",
        "price": 4023000, "compare_at_price": 4300000, "sku": "LEN-TCN50A-G5-27",
        "stock_quantity": 6, "category": "Desktops", "image": _wiki("Lenovo_ThinkCentre_AIO_Business_PC.jpeg"),
    },
    {
        "name": 'Lenovo IdeaPad Slim 3 14AMN8 14" Laptop',
        "description": "14-inch everyday laptop.",
        "price": 2185000, "compare_at_price": 2300000, "sku": "LEN-IPS3-14AMN8",
        "stock_quantity": 10, "category": "Laptops", "image": _wiki("Lenovo_IdeaPad_320.jpg"),
    },
    {
        "name": 'HP ProBook 4 G1iR 16" Laptop | Intel Core 5',
        "description": "16-inch business laptop, Intel Core 5.",
        "price": 3776000, "compare_at_price": 4000000, "sku": "HP-PB4-G1IR-16",
        "stock_quantity": 8, "category": "Laptops", "image": _wiki("HP_ProBook_640_G1.jpg"),
    },
    {
        "name": 'HP ProBook 4 G1iR 14" Laptop Intel Core 5 120U',
        "description": "14-inch business laptop, Intel Core 5 120U.",
        "price": 3776000, "compare_at_price": 4000000, "sku": "HP-PB4-G1IR-14",
        "stock_quantity": 8, "category": "Laptops", "image": _wiki("HP_ProBook_640_G1.jpg"),
    },
    {
        "name": 'HP ProBook 4 G1i 16" WUXGA Laptop | Intel',
        "description": "16-inch WUXGA business laptop.",
        "price": 4023000, "compare_at_price": 4300000, "sku": "HP-PB4-G1I-16",
        "stock_quantity": 6, "category": "Laptops", "image": _wiki("HP_ProBook_640_G1.jpg"),
    },
    {
        "name": 'Lenovo ThinkCentre Neo 50a Gen 5 24" FHD All-in-One',
        "description": "24-inch FHD all-in-one desktop PC.",
        "price": 3867000, "compare_at_price": 4000000, "sku": "LEN-TCN50A-G5-24",
        "stock_quantity": 7, "category": "Desktops", "image": _wiki("Lenovo_ThinkCentre_AIO_Business_PC.jpeg"),
    },
    {
        "name": 'Lenovo ThinkCentre Neo 50a Gen 5 24" FHD Multi-touch',
        "description": "24-inch FHD multi-touch all-in-one desktop PC.",
        "price": 4000000, "compare_at_price": 4300000, "sku": "LEN-TCN50A-G5-24MT",
        "stock_quantity": 5, "category": "Desktops", "image": _wiki("Lenovo_ThinkCentre_AIO_Business_PC.jpeg"),
    },
    {
        "name": "HP OMEN Transcend 14 Voco 25C1 Intel Core",
        "description": "14-inch gaming laptop, Intel Core.",
        "price": 9068000, "compare_at_price": 9250000, "sku": "HP-OMEN-TRANS14",
        "stock_quantity": 3, "category": "Laptops", "image": _wiki("My Omen - keyboard.jpg"),
    },
    {
        "name": "HP OMEN Hanna 16 Gaming Laptop Intel",
        "description": "16-inch gaming laptop, Intel.",
        "price": 11535000, "compare_at_price": 12000000, "sku": "HP-OMEN-HANNA16",
        "stock_quantity": 2, "category": "Laptops", "image": _wiki("My Omen - keyboard.jpg"),
    },
    {
        "name": "HP HyperX OMEN 15-ga0005TX Gaming",
        "description": "15-inch gaming laptop, HyperX edition.",
        "price": 8844000, "compare_at_price": 9000000, "sku": "HP-OMEN-15GA0005TX",
        "stock_quantity": 3, "category": "Laptops", "image": _wiki("My Omen - keyboard.jpg"),
    },
    {
        "name": 'Lenovo ThinkCentre Neo 50a Gen 6 24" All-in-One',
        "description": "24-inch all-in-one desktop PC, Gen 6.",
        "price": 5000000, "compare_at_price": 5500000, "sku": "LEN-TCN50A-G6-24A",
        "stock_quantity": 6, "category": "Desktops", "image": _wiki("Lenovo_ThinkCentre_AIO_Business_PC.jpeg"),
    },
    {
        "name": 'Lenovo ThinkCentre Neo 50a Gen 6 27" All-in-One',
        "description": "27-inch all-in-one desktop PC, Gen 6.",
        "price": 4800000, "compare_at_price": 5000000, "sku": "LEN-TCN50A-G6-27A",
        "stock_quantity": 5, "category": "Desktops", "image": _wiki("Lenovo_ThinkCentre_AIO_Business_PC.jpeg"),
    },
    {
        "name": 'Lenovo ThinkCentre Neo 50a Gen 6 24" All-in-One (B)',
        "description": "24-inch all-in-one desktop PC, Gen 6.",
        "price": 4600000, "compare_at_price": 5000000, "sku": "LEN-TCN50A-G6-24B",
        "stock_quantity": 5, "category": "Desktops", "image": _wiki("Lenovo_ThinkCentre_AIO_Business_PC.jpeg"),
    },
    {
        "name": 'Lenovo ThinkCentre Neo 50a Gen 6 27" All-in-One (B)',
        "description": "27-inch all-in-one desktop PC, Gen 6.",
        "price": 5257000, "compare_at_price": 5500000, "sku": "LEN-TCN50A-G6-27B",
        "stock_quantity": 4, "category": "Desktops", "image": _wiki("Lenovo_ThinkCentre_AIO_Business_PC.jpeg"),
    },
    {
        "name": "HP Laptop 15-fd1126nia Intel Core Ultra 5 125H",
        "description": "15-inch laptop, Intel Core Ultra 5 125H.",
        "price": 3104000, "compare_at_price": 3200000, "sku": "HP-15FD1126NIA",
        "stock_quantity": 10, "category": "Laptops", "image": _wiki("HP_ProBook_640_G1.jpg"),
    },
    {
        "name": "Lenovo ThinkCentre Neo 50t Gen 6 Desktop - Intel",
        "description": "Tower desktop PC, Gen 6, Intel.",
        "price": 3570000, "compare_at_price": 3800000, "sku": "LEN-TCN50T-G6",
        "stock_quantity": 6, "category": "Desktops", "image": _placeholder("Lenovo ThinkCentre Neo 50t"),
    },
    {
        "name": "Dell Pro Tower Essential QVT1260 Desktop PC",
        "description": "Tower desktop PC.",
        "price": 3485000, "compare_at_price": 3800000, "sku": "DELL-QVT1260-A",
        "stock_quantity": 7, "category": "Desktops", "image": _wiki("Optiplex_Mid-tower.jpg"),
    },
    {
        "name": "Dell Pro Tower Essential QVT1260 Desktop PC (B)",
        "description": "Tower desktop PC.",
        "price": 3194000, "compare_at_price": 3500000, "sku": "DELL-QVT1260-B",
        "stock_quantity": 7, "category": "Desktops", "image": _wiki("Optiplex_Mid-tower.jpg"),
    },
    {
        "name": "Dell Pro 15 PV15250 Laptop | Intel Core 3",
        "description": "15-inch laptop, Intel Core 3.",
        "price": 2342000, "compare_at_price": 2400000, "sku": "DELL-PV15250",
        "stock_quantity": 9, "category": "Laptops", "image": _wiki("Dell_Vostro_14_5000_Series_Laptop.jpg"),
    },
    {
        "name": 'Lenovo IdeaPad Slim 3 14AMN8 14" FHD Laptop',
        "description": "14-inch FHD everyday laptop.",
        "price": 2185000, "compare_at_price": 2500000, "sku": "LEN-IPS3-14AMN8-FHD",
        "stock_quantity": 10, "category": "Laptops", "image": _wiki("Lenovo_IdeaPad_320.jpg"),
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
