# Overview
This is the coin zmq publisher. It's purpose is to:
* receive zmq messages from coin processes
* broadcast received messages to api servers

# Mac Environment Setup
This guide will go through setup on an OSX machine.

### Node Version
Node.js v7.x or higher is required. Information and installation instructions are on [the nodejs website](https://nodejs.org/en/download/).

### Homebrew
Install homebrew to make installing software easier.  Information and installation instructions are on [the homebrew website](http://brew.sh/).

### ZeroMQ
Install ZeroMQ:

```
brew install zeromq
brew install zeromq-devel
```

## Check Out Code
clone this repo to your $HOME directory

## Install App Dependencies
Install npm modules:
```
cd ~/coin_zmq_publisher
npm install
```

## Set up coin nodes if you do not already have them
use the https://github.com/curtwphillips/blocks.git repo

## Update and run
update the lib/config.js file as necessary to use the proper ports. Start coin_zmq_publisher.

# Centos Environment Setup

## Basic requirements
Install yum packages:
```
sudo su
yum -y update
yum -y install git-all
```

Install epel:
```
wget http://dl.fedoraproject.org/pub/epel/7/x86_64/e/epel-release-7-9.noarch.rpm
rpm -ivh epel-release-7-9.noarch.rpm
```

Install yum packages that need epel:
```
yum -y install zeromq
yum -y install zeromq-devel
```

## Node.JS
Install node 9.x:
```
curl --silent --location https://rpm.nodesource.com/setup_9.x | sudo bash -
yum install -y nodejs
```

## Crypto
Create crypto user:
```
sudo useradd -m -d /home/crypto crypto
```

Change to crypto user
```
su crypto
```

Add /usr/local/bin to $PATH in the crypto .bashrc:
```
vi /home/crypto/.bashrc
```

Add this line:
```
export PATH=$PATH:/usr/local/bin
```

Add the same path in the root .bashrc:
```
exit
vi ~/.bashrc
```

Clone the repository at /home/crypto:
```
su crypto
cd /home/crypto
```

### Update g++ if current version is below 4.9 or not found. Check with g++ -version.
```
sudo yum -y install centos-release-scl
sudo yum -y install devtoolset-3-toolchain
scl enable devtoolset-3 bash
```

### Install App Dependencies
Install node dependencies in package.json:
```
cd /home/crypto/coin_zmq_publisher
npm install
```

### Ensure that crypto owns all /home/crypto files
```
sudo chown crypto:crypto /home/crypto/coin_zmq_publisher -R
```

## Install coin daemon
Install base requirements:
```
sudo yum -y install autoconf automake gcc-c++ libdb4-cxx libdb4-cxx-devel boost-devel openssl-devel libtool libevent-devel
```

## Set up coin nodes and run them
use the https://github.com/curtwphillips/blocks.git repo

## Start the crypto service

Use the update script to check out the most recent tag:
```
cd /home/crypto/coin_zmq_publisher
git show-ref # get the name of the most recent tag, like deploy-request-YYYY-MM-DD-A
sudo ./update.sh <name of most recent tag>
```

Put the systemd script in place:
```
sudo cp /home/crypto/coin_zmq_publisher/systemd/zmq.service /etc/systemd/system/zmq.service
sudo systemctl enable zmq
```

Start and optionally monitor the zmq service:
```
systemctl start zmq
journalctl -u zmq -f
```

# Tailing logs

ssh into a server and run journalctl -u zmq -f -n <number_of_lines_to_start_with>

-n is optional to start with a number of lines visible immediately
