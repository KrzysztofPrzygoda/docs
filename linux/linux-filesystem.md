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

## Directory Short List

### Required
The following directories, or symbolic links to directories, are required in `/`.  

Directory | Description 
:-------- | :----------
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

## Directory Extended List

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

## Specific Directories

### `/bin`
Essential user command binaries (for use by all users).
Contains commands that may be used by both the system administrator and by users, but which are required when no other filesystems are mounted (e.g. in single user mode). It may also contain commands which are used indirectly by scripts.

#### Requirements

There must be no subdirectories in `/bin`. The following commands, or symbolic links to commands, are required in `/bin`:

Command	| Description
:------ | :----------
`cat` | Utility to concatenate files to standard output
`chgrp` | Utility to change file group ownership
`chmod` | Utility to change file access permissions
`chown` | Utility to change file owner and group
`cp` | Utility to copy files and directories
`date` | Utility to print or set the system data and time
`dd` | Utility to convert and copy a file
`df` | Utility to report filesystem disk space usage
`dmesg` | Utility to print or control the kernel message buffer
`echo` | Utility to display a line of text
`false` | Utility to do nothing, unsuccessfully
`hostname` | Utility to show or set the system's host name
`kill` | Utility to send signals to processes
`ln` | Utility to make links between files
`login` | Utility to begin a session on the system
`ls` | Utility to list directory contents
`mkdir` | Utility to make directories
`mknod` | Utility to make block or character special files
`more` | Utility to page through text
`mount` | Utility to mount a filesystem
`mv` | Utility to move/rename files
`ps` | Utility to report process status
`pwd` | Utility to print name of current working directory
`rm` | Utility to remove files or directories
`rmdir` | Utility to remove empty directories
`sed` | The `sed' stream editor
`sh` | POSIX compatible command shell
`stty` | Utility to change and print terminal line settings
`su` | Utility to change user ID
`sync` | Utility to flush filesystem buffers
`true` | Utility to do nothing, successfully
`umount` | Utility to unmount file systems
`uname` | Utility to print system information

#### Specific Options

The following programs, or symbolic links to programs, must be in `/bin` if the corresponding subsystem is installed:

Command	| Description
:------ | :----------
`csh` | The C shell (optional) <br /> `/bin/csh` may be a symbolic link to `/bin/tcsh` or `/usr/bin/tcsh`
`ed` | The `ed' editor (optional)
`tar` | The tar archiving utility (optional)
`cpio` | The cpio archiving utility (optional)
`gzip` | The GNU compression utility (optional)
`gunzip` | The GNU uncompression utility (optional)
`zcat` | The GNU uncompression utility (optional)
`netstat` | The network statistics utility (optional)
`ping` | The ICMP network test utility (optional)

### `/etc`

Host-specific system configuration. The /etc hierarchy contains configuration files. A "configuration file" is a local file used to control the operation of a program; it must be static and cannot be an executable binary.

It is recommended that files be stored in subdirectories of /etc rather than directly in /etc.

#### Requirements

No binaries may be located under `/etc`.

The following directories, or symbolic links to directories are required in `/etc`:

Directory | Description
:-------- | :----------
`opt` | Configuration for `/opt`

#### Specific Options

The following directories, or symbolic links to directories must be in /etc, if the corresponding subsystem is installed:

Directory | Description
:-------- | :----------
`X11` | Configuration for the X Window system (optional)
`sgml` | Configuration for SGML (optional)
`xml` | Configuration for XML (optional)

The following files, or symbolic links to files, must be in `/etc` if the corresponding subsystem is installed:

File    | Description
:------ | :----------
`csh.login` | Systemwide initialization file for C shell logins (optional)
`exports` | NFS filesystem access control list (optional)
`fstab` | Static information about filesystems (optional)
`ftpusers` | FTP daemon user access control list (optional)
`gateways` | File which lists gateways for routed (optional)
`gettydefs` | Speed and terminal settings used by getty (optional)
`group` | User group file (optional)
`host.conf` | Resolver configuration file (optional)
`hosts` | Static information about host names (optional)
`hosts.allow` | Host access file for TCP wrappers (optional)
`hosts.deny` | Host access file for TCP wrappers (optional)
`hosts.equiv` | List of trusted hosts for rlogin, rsh, rcp (optional)
`hosts.lpd` | List of trusted hosts for lpd (optional)
`inetd.conf` | Configuration file for inetd (optional)
`inittab` | Configuration file for init (optional)
`issue` | Pre-login message and identification file (optional)
`ld.so.conf` | List of extra directories to search for shared libraries (optional)
`motd` | Post-login message of the day file (optional)
`mtab` | Dynamic information about filesystems (optional). `mtab` does not fit the static nature of `/etc`: it is excepted for historical reasons 
`mtools.conf` | Configuration file for mtools (optional)
`networks` | Static information about network names (optional)
`passwd` | The password file (optional)
`printcap` | The lpd printer capability database (optional)
`profile` | Systemwide initialization file for sh shell logins (optional)
`protocols` | IP protocol listing (optional)
`resolv.conf` | Resolver configuration file (optional)
`rpc` | RPC protocol listing (optional)
`securetty` | TTY access control for root login (optional)
`services` | Port names for network services (optional)
`shells` | Pathnames of valid login shells (optional)
`syslog.conf` | Configuration file for syslogd (optional)

### `/sbin`

System binaries. Utilities used for system administration (and other root-only commands) are stored in `/sbin`, `/usr/sbin`, and `/usr/local/sbin`.

`/sbin` contains binaries essential for booting, restoring, recovering, and/or repairing the system in addition to the binaries in `/bin`. Programs executed after `/usr` is known to be mounted (when there are no problems) are generally placed into `/usr/sbin`. Locally-installed system administration programs should be placed into `/usr/local/sbin`.

It is recommended that files be stored in subdirectories of /etc rather than directly in /etc.

#### Requirements

There must be no subdirectories in `/sbin`.

The following commands, or symbolic links to commands, are required in `/sbin`:

Command | Description
:------ | :----------
`shutdown` | Command to bring the system down.

#### Specific Options

The following files, or symbolic links to files, must be in `/sbin` if the corresponding subsystem is installed:

Command | Description
:------ | :----------
`fastboot` | Reboot the system without checking the disks (optional)
`fasthalt` | Stop the system without checking the disks (optional)
`fdisk` | Partition table manipulator (optional)
`fsck` | File system check and repair utility (optional)
`fsck.*` | File system check and repair utility for a specific filesystem (optional)
`getty` | The getty program (optional)
`halt` | Command to stop the system (optional)
`ifconfig` | Configure a network interface (optional)
`init` | Initial process (optional)
`mkfs` | Command to build a filesystem (optional)
`mkfs.*` | Command to build a specific filesystem (optional)
`mkswap` | Command to set up a swap area (optional)
`reboot` | Command to reboot the system (optional)
`route` | IP routing table utility (optional)
`swapon` | Enable paging and swapping (optional)
`swapoff` | Disable paging and swapping (optional)
`update` | Daemon to periodically flush filesystem buffers (optional)

### `/usr/bin`

Most user commands. This is the primary directory of executable commands on the system.

#### Requirements

There must be no subdirectories in `/usr/bin`.

#### Specific Options

The following files, or symbolic links to files, must be in `/usr/bin`, if the corresponding subsystem is installed:

Command | Description
:------ | :----------
`perl` | The Practical Extraction and Report Language (optional)
`python` | The Python interpreted language (optional)
`tclsh` | Simple shell containing Tcl interpreter (optional)
`wish` | Simple Tcl/Tk windowing shell (optional)
`expect` | Program for interactive dialog (optional)
