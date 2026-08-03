function getNextDate(date, type) {

    const next =
        new Date(date);


    switch (type) {

        case "daily":

            next.setDate(
                next.getDate() + 1
            );

            break;



        case "weekly":

            next.setDate(
                next.getDate() + 7
            );

            break;



        case "monthly":

            next.setMonth(
                next.getMonth() + 1
            );

            break;

    }


    return next;

}