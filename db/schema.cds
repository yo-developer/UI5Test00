namespace yo.test;
using { managed } from '@sap/cds/common';

  entity Entity1 : managed {
    key ID      : UUID  @(Core.Computed : true);
    title       : String not null;
    descr       : String;
  }