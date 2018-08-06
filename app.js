const SteamUser = require('steam-user');
const TeamFortress2 = require('tf2');

const client = new SteamUser();
const tf2 = new TeamFortress2(client);

const argv = require('minimist')(process.argv.slice());
const columnify = require('columnify')

const columns = (data) => {
    console.log(columnify(data, {showHeaders: false, minWidth: 20}));
};

client.logOn({
    accountName: argv.login,
    password: argv.password
});

client.on('error', (e) => console.log(e));

client.on('loggedOn', (details) => {
    client.gamesPlayed(440);
    columns({'logged': 'OK'});
    columns({
        'logged from': details.ip_country_code
    });

    const ids = {
        steam2: client.steamID.getSteam2RenderedID(),
        steam3: client.steamID.getSteam3RenderedID(),
        steam64: client.steamID.getSteamID64()
    }

    columns(ids);

    client.getSteamGuardDetails((enabled, enabledTime, machineTime, canTrade, twoFactorTime, hasPhone) => {
        const data = {
            'guard enabled': enabled,
            'can trade': canTrade,
            'has phone': hasPhone
        };

        if (enabled) {
            data['guard enabled time'] = enabledTime;
        }

        if (hasPhone) {
            data['two factor time'] = twoFactorTime;
        }

        columns(data);
    });

    client.getCredentialChangeTimes((lastPasswordChange, lastPasswordReset, lastEmailChange) => {
        const data = {};

        data['password changed'] = lastPasswordChange || 'never';
        data['password reset'] = lastPasswordReset || 'never';
        data['email changed'] = lastEmailChange || 'never';

        columns(data);
    });
});

client.on('newItems', (count) => columns({'pending items': count}));

client.on('emailInfo', (address, validated) => {
    columns({
        'email': address,
        'email validated': validated
    });
});

client.on('accountInfo', (name) => {
    columns({'profile name': name});
});

client.on('accountLimitations', (limited, communityBanned, locked, canInviteFriends) => {
	const limitations = {
        'limited': limited,
        'community banned': communityBanned,
        'locked': locked,
        'can invite friends': canInviteFriends
    };
    columns(limitations);
});

client.on('vacBans', (numBans, appids) => {
    const data = {
        'vac bans': numBans
    };
    if (appids.length > 0) {
        data['vac banned apps'] = appids.join(', ');
    }
	columns(data);
});

client.on('licenses', (licenses) => columns({'licenses count': licenses.length}));

client.on('wallet', (hasWallet, currency, balance) => {
    const data = {
        'has wallet': hasWallet,
        'wallet currency': currency,
        'wallet balance': balance
    };
    columns(data);
});

client.on('friends', () => {
    const data = {'friends count': client.myFriends.length};
    columns(data);
});

tf2.on('accountLoaded', () => {
    const data = {
        'tf2 premium': tf2.premium,
        'tf2 backpack slots': tf2.backpackSlots
    };

    columns(data);
    process.exit();
});