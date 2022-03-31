
const request = require('request-promise');
const Promise = require('bluebird');
const { v4: uuid } = require('uuid');
const { execAsync } = require('async-child-process');

const { HOST_2, SN_HOST_NAME_2, USER_NAME_2, PASSWORD_2, PROXY_2, PROXY_PORT_2 } = (process.env.HOST_2 || process.env.SN_HOST_NAME_2) ? process.env : require('minimist')(process.argv.slice(2));

const FQDN = (SN_HOST_NAME_2) ? SN_HOST_NAME_2 : `${HOST_2}.service-now.com`;

const start = () => {
    return Promise.try(() => {
        if (!HOST_2 && !SN_HOST_NAME_2)
            throw Error('HOST_2 or SN_HOST_NAME_2 is mandatory');
        if (!USER_NAME_2)
            throw Error('USER_NAME_2 is mandatory');
        if (!PASSWORD_2)
            throw Error('PASSWORD_2 is mandatory');

    }).then(() => {

        return request(`https://${FQDN}/stats.do`, {
            auth: {
                user: USER_NAME_2,
                password: PASSWORD_2
            }
        }).then((xml) => {
            let regex = /Build name:\s+(\w*)/im
            let m = xml.match(regex);
            const out = {
                city: undefined,
                date: undefined
            };
            if (m) {
                out.city = m[1].toLowerCase();
            }
            regex = /Build date:\s+([0-9_-]*)/im
            m = xml.match(regex);
            if (m) {
                out.date = m[1];
            }
            return out;
        })
    }).then((build) => {

        if (!build || !build.city)
            throw Error('No build information found ' + JSON.stringify(build))

        const tag = `${build.city}.${build.date}`

        console.log(`Checking for image for ${tag}`);

        console.log(`https://hub.docker.com/v2/repositories/moers/mid-server/tags/${tag}`)
        return request({ method: 'HEAD', url: `https://hub.docker.com/v2/repositories/moers/mid-server/tags/${tag}` }).then(() => true).catch(() => false).then((found) => {
            if (found)
                return tag;

            console.log(`No image found for tag '${tag}'. Checking for image for ${build.city}`);
            return request({ method: 'HEAD', url: `https://hub.docker.com/v2/repositories/moers/mid-server/tags/${build.city}` }).then(() => true).catch(() => false).then((found) => {
                if (found)
                    return build.city;

                console.log(`No image found for ${build.city}`);
                return null
            });

        });

    }).then((tag) => {
        if (!tag)
            throw Error('No docker image found', tag)

        const name = `mid-${tag}-${uuid().split('-')[0]}`;

        console.log(`Starting docker container '${name}' for environment '${FQDN}'`);
        
        const command = `docker run -d --name ${name}  --env SN_HOST_NAME_2=${FQDN} --env USER_NAME_2=${USER_NAME_2} --env PASSWORD_2=${PASSWORD_2} ${(PROXY_2) ? `--env PROXY_2=${PROXY_2}` : ''} ${(PROXY_PORT_2) ? `--env PROXY_PORT_2=${PROXY_PORT_2}` : ''} moers/mid-server:${tag}`;
        return execAsync(command, { cwd: './' }).then(({ stdout, stderr }) => {
            console.log(stdout);
        })
    }).catch((e) => {
        console.error(e);
    })

}
start();
