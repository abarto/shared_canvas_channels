# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/trusty64"

  config.vm.define "shared-canvas-channels-vm" do |vm_define|
  end

  config.vm.hostname = "shared-canvas-channels.local"

  config.vm.network "forwarded_port", guest: 80, host: 8000
  config.vm.network "forwarded_port", guest: 8000, host: 8001

  config.vm.synced_folder ".", "/home/vagrant/shared_canvas_channels/"

  config.vm.provider "virtualbox" do |vb|
    vb.memory = "1024"
    vb.name = "shared-canvas-channels-vm"
  end

  config.vm.provision "shell", inline: <<-SHELL
    apt-get update
    apt-get install -y supervisor nginx git build-essential python python-dev python-virtualenv postgresql postgresql-server-dev-all redis-server

    sudo -u postgres psql --command="CREATE USER shared_canvas_channels WITH PASSWORD 'shared_canvas_channels';"
    sudo -u postgres psql --command="CREATE DATABASE shared_canvas_channels WITH OWNER shared_canvas_channels;"
    sudo -u postgres psql --command="GRANT ALL PRIVILEGES ON DATABASE shared_canvas_channels TO shared_canvas_channels;"
  SHELL
end
