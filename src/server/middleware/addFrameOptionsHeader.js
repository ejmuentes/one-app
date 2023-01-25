/*
 * Copyright 2019 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import matcher from 'matcher';
import { getCSP } from './csp';

export default function addFrameOptionsHeader(req, res, next) {
  req.tracer.serverStartTimer({ key: 'addFrameOptionsHeader' });
  const referer = req.get('Referer');

  const frameAncestorDomains = getCSP()['frame-ancestors'];
  const trimmedReferrer = referer && referer.replace('https://', '');
  const matchedDomain = frameAncestorDomains && frameAncestorDomains.find((domain) => matcher.isMatch(trimmedReferrer, `${domain}/*`)
  );

  if (matchedDomain) {
    res.set('X-Frame-Options', `ALLOW-FROM ${referer}`);
  }
  req.tracer.serverEndTimer({ key: 'addFrameOptionsHeader' });

  next();
}
