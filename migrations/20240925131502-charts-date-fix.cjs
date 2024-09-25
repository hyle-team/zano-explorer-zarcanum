'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      const allCharts = (await queryInterface.sequelize.query(
        `
        SELECT "id", "actual_timestamp"
        FROM "charts"
        `,
        { transaction }
      ));

      const chartsArray = allCharts[0];

      for (let i = 0; i < chartsArray.length; i++) {
        const chart = chartsArray[i];
        
        console.log('Processing chart', i);
        const { actual_timestamp } = chart;
        const newTimestamp = +new Date(actual_timestamp) * 1000;

        await queryInterface.sequelize.query(
          `
          UPDATE "charts"
          SET "actual_timestamp" = :newTimestamp
          WHERE "id" = :id
          `,
          {
            transaction,
            replacements: {
              id: chart.id,
              newTimestamp: new Date(newTimestamp),
            },
          }
        );

      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert back to the original misinterpreted timestamps
    return queryInterface.sequelize.transaction(async (transaction) => {
      const allCharts = (await queryInterface.sequelize.query(
        `
        SELECT "id", "actual_timestamp"
        FROM "charts"
        `,
        { transaction }
      ));

      const chartsArray = allCharts[0];

      for (let i = 0; i < chartsArray.length; i++) {
        const chart = chartsArray[i];
        
        console.log('Processing chart', i);
        const { actual_timestamp } = chart;
        const newTimestamp = +new Date(actual_timestamp) / 1000;

        await queryInterface.sequelize.query(
          `
          UPDATE "charts"
          SET "actual_timestamp" = :newTimestamp
          WHERE "id" = :id
          `,
          {
            transaction,
            replacements: {
              id: chart.id,
              newTimestamp: new Date(newTimestamp),
            },
          }
        );

      }
    });
  },
};
