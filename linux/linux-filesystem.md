# Linux Filesystem Hierarchy Standard (FHS)

## Reference

- Filesystem Hierarchy Standard
    - Original specification on [linuxfundation.org](https://refspecs.linuxfoundation.org/fhs.shtml)
    - Additional comments on [tldp.org](https://www.tldp.org/LDP/Linux-Filesystem-Hierarchy/html/Linux-Filesystem-Hierarchy.html)
- OS Manuals
    - [Debian Reference](https://www.debian.org/doc/manuals/debian-reference/index.en.html)

## Quick Look

`/bin` > `/usr/bin` : Essential user command binaries (for use by all users).  
`/boot` : Static files of the boot loader.  
`/dev` : Device files.  
`/dev/null` : All data written to this device is discarded. A read from this device will return an EOF condition.  
`/dev/zero` : This device is a source of zeroed out data. All data written to this device is discarded. A read from this device will return as many bytes containing the value zero as was requested.  
`/dev/tty` : This device is a synonym for the controlling terminal of a process. Once this device is opened, all reads and writes will behave as if the actual controlling terminal device had been opened.  
`/etc` : System configuration files.  
`/etc/opt` : Configuration files for `/opt`.  
`/etc/X11` : Configuration for the X Window System (optional).  
`/etc/sgml` : Configuration files for SGML (optional).  
`/etc/xml` : Configuration files for XML (optional).  
`/home` : User home directories (optional).  
`/lib` : Essential shared libraries and kernel modules.  
`/lib<qual>` : Alternate format essential shared libraries (optional).  
`/media` : Mount point for removable media.  
`/mnt` : Mount point for a temporarily mounted filesystem.  
`/opt` : Add-on application software packages.  
`/proc` : Kernel and process information virtual filesystem. Only exists in memory.  
`/root` : Home directory for the root user (optional).  
`/run` : Run-time variable data for system deamons (eg. `systemd`, `udev`).  
`/sbin` > `/usr/sbin` : System command binaries.  
`/srv` : Data for services provided by this system.  
`/sys` : Kernel and system information virtual filesystem, where information about devices, drivers, and some kernel features is exposed. Its underlying structure is determined by the particular Linux kernel being used at the moment, and is otherwise unspecified.  
`/tmp` : Temporary files.  
`/usr` : Shareable, read-only data.  
`/usr/bin` : Most user commands. This is the primary directory of executable commands on the system.  
`/usr/include` : Directory for standard include files. This is where all of the system's general-use include files for the C programming language should be placed.  
`/usr/lib` : Libraries for programming and packages.  
`/usr/libexec` : Binaries run by other programs (optional).  
`/usr/lib<qual>` : Alternate format libraries (optional).  
`/usr/local` : Local hierarchy.  
`/usr/sbin` : Non-essential standard system binaries.  
`/usr/share` : Architecture-independent data.  
`/usr/share/color` : Color management information (optional).  
`/usr/share/dict` : Word lists (optional).  
`/usr/share/man` : Manual pages.  
`/usr/share/man/man1` :	User programs (optional).  
`/usr/share/man/man2` :	System calls (optional).  
`/usr/share/man/man3` :	Library calls (optional).  
`/usr/share/man/man4` : Special files (optional).  
`/usr/share/man/man5` : File formats (optional).  
`/usr/share/man/man6` : Games (optional).  
`/usr/share/man/man7` : Miscellaneous (optional).  
`/usr/share/man/man8` : System administration (optional).  
`/usr/share/misc` : Miscellaneous architecture-independent data.  
`/usr/share/ppd` : Printer definitions (optional).  
`/usr/share/sgml` : SGML data (optional).
`/usr/share/xml` : XML data (optional).  
`/usr/src` : Source code (optional). Source code may be placed in this subdirectory, only for reference purposes.  
`/var` : Variable data files. This includes spool directories and files, administrative and logging data, and transient and temporary files.  
`/var/account` : Process accounting logs (optional).  
`/var/cache` : Application cache data.  
`/var/crash` : System crash dumps (optional).  
`/var/games` : Variable game data (optional).  
`/var/lib` : Variable state information.
`/var/lock` : Lock files.  
`/var/log` : Log files and directories.  
`/var/mail` : User mailbox files (optional).  
`/var/opt` : Variable data for `/opt`.  
`/var/run` : Run-time variable data.  
`/var/spool` : Application spool data which is awaiting some kind of later processing.  
`var/spool/cron` : Cron and at jobs variable data.  
`/var/tmp` : Temporary files preserved between system reboots.  