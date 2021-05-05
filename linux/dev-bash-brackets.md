# Bash Guide


## Reference
## Brackets
- https://www.assertnotmagic.com/2018/06/20/bash-brackets-quick-reference/
### ( Single Parentheses )
#### Subshell
Running commands inside in a subshell (new process).
```bash
a='This string'
( a=banana; mkdir $a )
echo $a
# => 'This string'
ls
# => ...
# => banana/
```
#### Arrays
Declaring arrays. Arrays and associative arrays are only available in newer versions of Bash.
```bash
cheeses=('cheddar' 'swiss' 'provolone' 'brie')
echo "${cheeses[2]}"
# => swiss
cheeses+='american'
for cheese in $cheeses; do
  echo "$cheese"
done
# => cheddar
# => swiss
# => provolone
# => brie
# => american
```
In the input inside the parentheses, Bash uses the current environment variable $IFS (field separator) and will split the array string on any character found in $IFS. So one way you can split a string on a character is something like this:
```bash
grade_string='A;B;F;D;C;A-'
IFS=';' grades=($grade_string)
echo "${grades[1]}"
# => B
echo "${grades[3]}"
# => D
```

### (( Double Parentheses ))

This is for use in **integer arithmetic** without output. No decimals. Look into `bc` for floating point calculations.

You can perform assignments, logical operations, and mathematic operations like multiplication or modulo inside these parentheses. Any variable changes that happen inside them will stick, but don’t expect to be able to assign the result to anything. If the result inside is non-zero, it returns a zero (success) exit code. If the result inside is zero, it returns an exit code of 1.
```bash
i=4
(( i += 3 ))
echo $i
# => 7
(( 4 + 8 ))
# => No Output
echo $?  # Check the exit code of the last command
# => 0
(( 5 - 5 ))
echo $?
# => 1

# Strings inside get considered 'zero'.
(( i += POO ))
echo $i
# => 7

# You can't use it in an expression
a=(( 4 + 1 ))
# => bash: syntax error near unexpected token '('
```
### $(( Dollar Double Parentheses ))

**Arithmetic Interpolation**, which means with output to string.

```bash
a=$(( 16 + 2 ))
message="I don't want to brag, but I have like $(( a / 2 )) friends."
echo $message
# => I don't want to brag, but I have like 9 friends."

b=$(( a *= 2 ))			# You can even do assignments.  The last value calculated will be the output.
echo $b
# => 36
echo $a
# => 36
```

### <( Angle Parentheses )

This is known as a **process substitution**.

It’s a lot like a pipe, except you can use it anywhere a command expects a file argument. And you can use multiple at once!

```bash
sort -nr -k 5 <( ls -l /bin ) <( ls -l /usr/bin ) <( ls -l /sbin )

# => Like a billion lines of output that contain many of the
# => executables on your computer, sorted in order of descending size.

# Just in case you don't magically remember all bash flags,
# -nr  means sort numerically in reverse (descending) order
# -k 5 means sort by Kolumn 5.  In this case, for `ls -l`, that is the "file size"
```
`comm` command spits out the lines that the files have in common. Because comm needs its input files to be sorted, you could either do this:

```bash
# Instead of this:
sort file1 > file1.sorted
sort file2 > file2.sorted
comm -12 file1.sorted file2.sorted
# You can do that:
comm -12 <( sort file1 ) <( sort file2 )
```
### $( Dollar Single Parentheses )

This is for **interpolating a subshell command output into a string**. 

The command inside gets run inside a subshell, and then any output gets placed into whatever string you’re building.

```bash
intro="My name is $( whoami )"
echo $intro
# => My name is ryan

# And just to prove that it's a subshell...
a=5
b=$( a=1000; echo $a )
echo $b
# => 1000
echo $a
# => 5
```

### $( Dollar Single Parentheses Dollar Q )$?

If you want to interpolate a command, but only the exit code and not the value, this is what you use.

```bash
if [[ $( grep -q PATTERN FILE )$? ]]
then
    echo "Dat pattern was totally in dat file!"
else
    echo "NOPE."
fi
```

However, in Bash, if statements will process the then branch if the expression after if has an exit code of 0 and the else branch otherwise, so, in this case, Matthew notes that we can drop all of the fancy stuff and simplify to:

```bash
if grep -q PATTERN FILE; then
    echo "Vee haf found eet!"
else
    echo "No.  Lame."
fi
```

### [ Single Square Brackets ]

Alternative to built-in `test`.

`test` and `[` are actually shell commands.

Strings of zero length are false. Strings of length one or more (even if those characters are whitespace) are true.

- [List of file-related tests](http://tldp.org/LDP/abs/html/fto.html)
- [List of string- and integer-related tests](https://www.tldp.org/LDP/abs/html/comparison-ops.html)

```bash
if [ -f my_friends.txt ]
then
	echo "I'm so loved!"
else
	echo "I'm so alone."
fi
```

Single Square Brackets do **word splitting** or **filename expansion**.

```bash
# If there's no files .txt files
# *.txt gets expanded to a blank string:
[ -f *.txt ]; echo $?
# => 1

touch file1.txt
# Now there's exactly one .txt file
# *.txt gets expanded to a one matching filename:
[ -f *.txt ]; echo $?
# => 0

touch file2.txt
# Now there's two files
# *.txt gets expanded to a space-separated list of matching filenames:
[ -f *.txt ]
# => bash: [: too many arguments.
```
### [[ Double Square Brackets ]]

**Truth testing.**

`[[ ]]` is actually **part of the shell language** itself. What this means is that the stuff inside of Double Square Brackets isn’t treated like arguments.

```bash
[[ -f *.txt ]]; echo $?
# => 1.  There no file called exactly '*.txt'
```

Additionally, double square brackets support extended regular expression matching. Use quotes around the second argument to force a raw match instead of a regex match.

```bash
pie=good
[[ $pie =~ d ]]; echo $?
# => 0, it matches the regex!

[[ $pie =~ [aeiou]d ]]; echo $?
# => 0, still matches

[[ $pie =~ [aei]d ]]; echo $?
# => 1, no match

[[ $pie =~ "[aeiou]d" ]]; echo $?
# => 1, no match because there's no literal '[aeoiu]d' inside the word "good"
```

### Function Parens/Braces() { … }

There’s several ways to define functions in Bash:

```bash
function hi_there() {
    echo "Hi"
}

hi_there() {
    echo "Hi"
}

function hi_there {
    echo "Hi"
}

# All above versions work fine with the C-style brace
# arrangement too.
hi_there()
{
    echo "Hi"
}
```

The round parentheses are there solely for decoration. Passing args to a function:
```bash
function hi_there() {
  name="$1"
  echo "Hi $name!"
}
```

### { Single Curly Braces }

Expansion:
```bash
echo h{a,e,i,o,u}p
# => hap hep hip hop hup
echo "I am "{cool,great,awesome}
# => I am cool I am great I am awesome

mv friends.txt{,.bak}
# => braces are expanded first, so the command is `mv friends.txt friends.txt.bak`
```

Ranges:
```bash
echo {01..10}
01 02 03 04 05 06 07 08 09 10
echo {01..10..3}
01 04 07 10
```

Grouping commands (run in current shell):
```bash
[[ "$1" == secret ]] && { echo "The fox flies at midnight"; echo "Ssssshhhh..." }
```

### ${Dollar Braces}

This is for **variable interpolation**.

To avoid normal string interpolation problems:

```bash
# I want to say 'bananaification'
fruit=banana
echo $fruitification
# => "" No output, because $fruitification is not a variable.
echo ${fruit}ification
# => bananaification
```

Using a default value if the variable isn’t defined:
```bash
function hello() {
    echo "Hello, ${1:-World}!"
}
hello Ryan
# => Hello Ryan!
hello
# => Hello World!

function sign_in() {
    name=$1
    echo "Signing in as ${name:-$( whoami )}"
}
sign_in
# => Signing in as ryan
sign_in coolguy
# => Signing in as coolguy
```

Getting the length of a variable:
```bash
name="Ryan"
echo "Your name is ${#name} letters long!"
# => Your name is 4 letters long!
```

Chopping off pieces that match a pattern:
```bash
url=https://assertnotmagic.com/about
echo ${url#*/}     # Remove from the front, matching the pattern */, non-greedy
# => /assertnotmagic.com/about
echo ${url##*/}    # Same, but greedy
# => about
echo ${url%/*}     # Remove from the back, matching the pattern /*, non-greedy
# => https://assertnotmagic.com
echo ${url%%/*}    # Same, but greedy
# => https:/
```

Uppercase matching letters:
```bash
echo ${url^^a}
# => https://AssertnotmAgic.com/About
```

Get slices of strings:
```bash
echo ${url:2:5}  # the pattern is ${var:start:len}.  Start is zero-based.
# => tps://
```

Replace patterns:
```bash
echo ${url/https/ftp}
# => ftp://assertnotmagic.com

# Use a double slash for the first slash to do a global replace
echo ${url//[aeiou]/X}
# => https://XssXrtnXtmXgXc.cXm
```

Use variables indirectly as the name of other variables:
```bash
function grades() {
  name=$1
  alice=A
  beth=B
  charles=C
  doofus=D
  echo ${!name}
}

grades alice
# => A
grades doofus
# => D
grades "Valoth the Unforgiving"
# => bash: : bad substitution.
# There is no variable called Valoth the Unforgiving,
# so it defaults to a blank value.
# Then, bash looks for a variable with a name of "" and errors out.
```

### <<Double Angle Heredocs

This is how you make **multiline strings** in Bash (one method).

Two arrows and then a word – any word that you choose – to signal the start of the string. The string doesn’t end until you repeat your magic word.

```bash
nice_message=<<MESSAGE
Hi there!  I really like the way you look
when you are teaching newbies things
with empathy and compassion!
You rock!
MESSAGE

echo $nice_message
# => Hi there!  I really like the way you look
# => when you are teaching newbies things
# => with empathy and compassion!
# => You rock!
```

Add a dash after the arrows to suppress any leading tabs (but not spaces):
```bash
cat <<-HEREDOC
        two leading tabs
    one leading tab
  two spaces here
HEREDOC

# => two leading tabs
# => one leading tab
# =>   two spaces here
```