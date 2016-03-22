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
    vb.cpus = 2
    vb.name = "shared-canvas-channels-vm"
  end

  config.vm.provision "shell", inline: <<-SHELL
    apt-get update
    apt-get install -y supervisor nginx git build-essential python python-dev python-virtualenv postgresql postgresql-server-dev-all redis-server

    sudo -u postgres psql --command="CREATE USER shared_canvas_channels WITH PASSWORD 'shared_canvas_channels';"
    sudo -u postgres psql --command="CREATE DATABASE shared_canvas_channels WITH OWNER shared_canvas_channels;"
    sudo -u postgres psql --command="GRANT ALL PRIVILEGES ON DATABASE shared_canvas_channels TO shared_canvas_channels;"
  SHELL

  config.vm.provision "shell", privileged: false, inline: <<-SHELL
    virtualenv --no-pip shared_canvas_channels_venv
    source shared_canvas_channels_venv/bin/activate
    curl --silent --show-error --retry 5 https://bootstrap.pypa.io/get-pip.py | python

    pip install -r shared_canvas_channels/requirements.txt

    cd shared_canvas_channels/shared_canvas_channels/

    nodeenv --prebuilt --python-virtualenv
    npm install --global bower

    python manage.py migrate
    python manage.py bower_install
    python manage.py loaddata auth.json
    python manage.py collectstatic --noinput
  SHELL

  config.vm.provision "shell", inline: <<-SHELL
    echo '
upstream shared_canvas_channels_upstream {
    server 127.0.0.1:8000 fail_timeout=0;
}

map $http_upgrade $connection_upgrade {
    default upgrade;
    ""      close;
}

server {
    listen 80;
    server_name localhost;

    client_max_body_size 4G;

    access_log /home/vagrant/shared_canvas_channels/nginx_access.log;
    error_log /home/vagrant/shared_canvas_channels/nginx_error.log;

    location /static/ {
        alias /home/vagrant/shared_canvas_channels/shared_canvas_channels/static/;
    }

    location / {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_redirect off;
        if (!-f $request_filename) {
            proxy_pass http://shared_canvas_channels_upstream;
            break;
        }
    }

    location /events {
        proxy_pass http://shared_canvas_channels_upstream;
        proxy_set_header Host $http_host;
        proxy_redirect off;
        proxy_buffering off;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
    ' > /etc/nginx/conf.d/shared_canvas_channels.conf

    /usr/sbin/service nginx restart

    echo '
[program:shared_canvas_channels_daphne]
user = vagrant
directory = /home/vagrant/shared_canvas_channels/shared_canvas_channels
command = /home/vagrant/shared_canvas_channels_venv/bin/daphne shared_canvas_channels.asgi:channel_layer
autostart = true
autorestart = true
stderr_logfile = /home/vagrant/shared_canvas_channels/daphne_stderr.log
stdout_logfile = /home/vagrant/shared_canvas_channels/daphne_stdout.log
stopsignal = INT
    ' > /etc/supervisor/conf.d/shared_canvas_channels_daphne.conf

    echo '
[program:shared_canvas_channels_runworker]
process_name = shared_canvas_channels_runworker-%(process_num)s
user = vagrant
directory = /home/vagrant/shared_canvas_channels/shared_canvas_channels
command = /home/vagrant/shared_canvas_channels_venv/bin/python /home/vagrant/shared_canvas_channels/shared_canvas_channels/manage.py runworker
numprocs = 6
autostart = true
autorestart = true
stderr_logfile = /home/vagrant/shared_canvas_channels/runworker_stderr.log
stdout_logfile = /home/vagrant/shared_canvas_channels/runworker_stdout.log
stopsignal = INT
    ' > /etc/supervisor/conf.d/shared_canvas_channels_runworker.conf

    /usr/bin/supervisorctl reload
  SHELL
end
