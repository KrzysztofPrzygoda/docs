# Linux Filesystem Hierarchy Standard (FHS)

## Reference

- Filesystem Hierarchy Standard
    - Original specification on [linuxfundation.org](https://refspecs.linuxfoundation.org/fhs.shtml)
    - Additional comments on [tldp.org](https://www.tldp.org/LDP/Linux-Filesystem-Hierarchy/html/Linux-Filesystem-Hierarchy.html)
- OS Manuals
    - [Debian Reference](https://www.debian.org/doc/manuals/debian-reference/index.en.html)

## The Filesystem

This standard assumes that the operating system underlying an FHS-compliant file system supports the same basic security features found in most UNIX filesystems.

It is possible to define two independent distinctions among files: 

- **shareable** vs. **unshareable** and
- **variable** vs. **static**.

In general, files that differ in either of these respects should be located in different directories. This makes it easy to store files with different usage characteristics on different filesystems.

Type | Description
--- | ---
**Shareable** | Files that can be stored on one host and used on others.
**Unshareable** | Files that are not shareable. For example, the files in user home directories are shareable whereas device lock files are not.
**Static** | Files that do not change without system administrator intervention (e.g. binaries, libraries, documentation etc.).
**Variable** | Files that are not static.

### Rationale

Shareable files can be stored on one host and used on several others. Typically, however, not all files in the filesystem hierarchy are shareable and so each system has local storage containing at least its unshareable files. It is convenient if all the files a system requires that are stored on a foreign host can be made available by mounting one or a few directories from the foreign host.

Static and variable files should be segregated because static files, unlike variable files, can be stored on read-only media and do not need to be backed up on the same schedule as variable files.

Historical UNIX-like filesystem hierarchies contained both static and variable files under both `/usr` and `/etc`. In order to realize the advantages mentioned above, the `/var` hierarchy was created and all variable files were transferred from `/usr` to `/var`. Consequently `/usr` can now be mounted read-only (if it is a separate filesystem). Variable files have been transferred from `/etc` to `/var` over a longer period as technology has permitted.

## Short List

### Required
The following directories, or symbolic links to directories, are required in `/`.  

Directory | Description 
:-------- | :----------
`/bin`    | Essential command binaries. 
`/bin`    | Essential command binaries.  
`/boot`   | Static files of the boot loader.  
`/dev`    | Device files.  
`/etc`    | Host-specific system configuration.  
`/lib`    | Essential shared libraries and kernel modules.  
`/media`  | Mount point for removable media.  
`/mnt`	  | Mount point for mounting a filesystem temporarily.  
`/opt`	  | Add-on application software packages.  
`/run`	  | Data relevant to running processes.  
`/sbin`	  | Essential system binaries.  
`/srv`	  | Data for services provided by this system.  
`/tmp`	  | Temporary files.  
`/usr`	  | Secondary hierarchy.  
`/var`	  | Variable data.  

### Specific Options
The following directories, or symbolic links to directories, must be in `/`, if the corresponding subsystem is installed:  

Directory    | Description 
:----------- | :----------
`/home`	     | User home directories (optional).  
`/lib<qual>` | Alternate format essential shared libraries (optional).  
`/root`	     | Home directory for the root user (optional).  

## Extended List

Directory    | Description 
:----------- | :----------
`/bin` > `/usr/bin` | Essential user command binaries (for use by all users).  
`/boot` | Static files of the boot loader.  
`/dev` | Device files.  
`/dev/null` | All data written to this device is discarded. A read from this device will return an EOF condition.  
`/dev/zero` | This device is a source of zeroed out data. All data written to this device is discarded. A read from this device will return as many bytes containing the value zero as was requested.  
`/dev/tty` | This device is a synonym for the controlling terminal of a process. Once this device is opened, all reads and writes will behave as if the actual controlling terminal device had been opened.  
`/etc` | System configuration files.  
`/etc/opt` | Configuration files for `/opt`.  
`/etc/X11` | Configuration for the X Window System (optional).  
`/etc/sgml` | Configuration files for SGML (optional).  
`/etc/xml` | Configuration files for XML (optional).  
`/home` | User home directories (optional).  
`/lib` | Essential shared libraries and kernel modules.  
`/lib<qual>` | Alternate format essential shared libraries (optional).  
`/media` | Mount point for removable media.  
`/mnt` | Mount point for a temporarily mounted filesystem.  
`/opt` | Add-on application software packages.  
`/proc` | Kernel and process information virtual filesystem. Only exists in memory.  
`/root` | Home directory for the root user (optional).  
`/run` | Run-time variable data for system deamons (eg. `systemd`, `udev`).  
`/sbin` > `/usr/sbin` | System command binaries.  
`/srv` | Data for services provided by this system.  
`/sys` | Kernel and system information virtual filesystem, where information about devices, drivers, and some kernel features is exposed. Its underlying structure is determined by the particular Linux kernel being used at the moment, and is otherwise unspecified.  
`/tmp` | Temporary files.  
`/usr` | Shareable, read-only data.  
`/usr/bin` | Most user commands. This is the primary directory of executable commands on the system.  
`/usr/include` | Directory for standard include files. This is where all of the system's general-use include files for the C programming language should be placed.  
`/usr/lib` | Libraries for programming and packages.  
`/usr/libexec` | Binaries run by other programs (optional).  
`/usr/lib<qual>` | Alternate format libraries (optional).  
`/usr/local` | Local hierarchy.  
`/usr/sbin` | Non-essential standard system binaries.  
`/usr/share` | Architecture-independent data.  
`/usr/share/color` | Color management information (optional).  
`/usr/share/dict` | Word lists (optional).  
`/usr/share/man` | Manual pages.  
`/usr/share/man/man1` |	User programs (optional).  
`/usr/share/man/man2` |	System calls (optional).  
`/usr/share/man/man3` |	Library calls (optional).  
`/usr/share/man/man4` | Special files (optional).  
`/usr/share/man/man5` | File formats (optional).  
`/usr/share/man/man6` | Games (optional).  
`/usr/share/man/man7` | Miscellaneous (optional).  
`/usr/share/man/man8` | System administration (optional).  
`/usr/share/misc` | Miscellaneous architecture-independent data.  
`/usr/share/ppd` | Printer definitions (optional).  
`/usr/share/sgml` | SGML data (optional).
`/usr/share/xml` | XML data (optional).  
`/usr/src` | Source code (optional). Source code may be placed in this subdirectory, only for reference purposes.  
`/var` | Variable data files. This includes spool directories and files, administrative and logging data, and transient and temporary files.  
`/var/account` | Process accounting logs (optional).  
`/var/cache` | Application cache data.  
`/var/crash` | System crash dumps (optional).  
`/var/games` | Variable game data (optional).  
`/var/lib` | Variable state information.
`/var/lock` | Lock files.  
`/var/log` | Log files and directories.  
`/var/mail` | User mailbox files (optional).  
`/var/opt` | Variable data for `/opt`.  
`/var/run` | Run-time variable data.  
`/var/spool` | Application spool data which is awaiting some kind of later processing.  
`var/spool/cron` | Cron and at jobs variable data.  
`/var/tmp` | Temporary files preserved between system reboots.  