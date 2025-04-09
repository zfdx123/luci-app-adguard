#
# This is free software, licensed under the Apache License, Version 2.0 .
#

include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-adguard

LUCI_TITLE:=LuCI app for AdGuardHome
LUCI_PKGARCH:=all
LUCI_DEPENDS:=+adguardhome
LUCI_DESCRIPTION:=LuCI support for AdGuardHome


define Package/luci-app-adguard/preinst
#!/bin/sh
if [ -e /etc/init.d/adguardhome ]; then
	/etc/init.d/adguardhome stop
	/etc/init.d/adguardhome disable
	chmod -x /etc/init.d/adguardhome
fi
exit 0
endef

define Package/luci-app-adguard/postrm
#!/bin/sh
if [ -e /etc/init.d/adguardhome ]; then
	chmod +x /etc/init.d/adguardhome
fi
exit 0
endef


include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
