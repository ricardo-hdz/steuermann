const fs = require('fs');
const glob = require('glob');

import { getReportDirectory, compareResultsToBaseline } from './reports';
import { audit } from './audit';
import config from './config';

audit(config.baseAuditPath).then((results: { js: any , json: any }) => {
    console.log(`Finished audit for ${ config.baseAuditPath }`);
});
