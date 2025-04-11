
const fileInput = document.getElementById('fileInput');
const fileContentDiv = document.getElementById('fileContent');
const imgRelativePath = '../iGreenData/assets/images/';
var toyRobotCommands = [];

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            if (content.trim().length > 0) {
                transformCommands(content);
                let exeComDiv = document.getElementById('exeComDiv');
                exeComDiv.style.display = 'block';
            }
        };
        reader.onerror = (e) => {
            console.error("Error reading the file:", e);
            fileContentDiv.textContent = "Error reading the file.";
        };
        reader.readAsText(file);
    } else {
        fileContentDiv.textContent = "No file selected.";
    }
});

btnExecuteCommand.addEventListener('click', async () => {
    let commandDiv = document.getElementById('commandDiv');
    commandDiv.style.display = 'block';
    let index = 0;
    for (let command of toyRobotCommands) {
        for (let internalCommand of command) {
            await delay(1000);
            if (internalCommand.indexOf(' ') > -1) {
                let coordinates = internalCommand.split(' ')[1].split(',');
                let xCoordinate = coordinates[0];
                let yCoordinate = coordinates[1];
                let direction = coordinates[2].toLowerCase();

                let targetDiv = document.querySelector(`.x-${xCoordinate} .y-${yCoordinate}`);
                if (targetDiv == null) {
                    addTextToCommandDiv(internalCommand);
                    robotFallFromTable();
                    break;
                }
                clearDiv(targetDiv);
                const imgElement = document.createElement('img');
                imgElement.src = `${imgRelativePath}${direction}.png`;
                imgElement.width = '60';
                targetDiv.appendChild(imgElement);
            }
            if (internalCommand == 'MOVE') {
                let imgNameWithoutExtension = getImageName();
                let { xCoordinate, yCoordinate } = getImageCoordinates();
                switch (imgNameWithoutExtension.toLocaleLowerCase()) {
                    case 'north':
                        xCoordinate = parseInt(xCoordinate) + 1;
                        break;
                    case 'south':
                        xCoordinate = parsentInt(xCoordinate) - 1;
                        break;
                    case 'east':
                        yCoordinate = parseInt(yCoordinate) + 1;
                        break;
                    case 'west':
                        yCoordinate = parseInt(yCoordinate) - 1;
                        break;
                }
                moveImage(imgNameWithoutExtension, xCoordinate, yCoordinate);
            }

            if (internalCommand == 'LEFT') {
                let newImgNameWithoutExtension = getLeftRotationImage();
                let { xCoordinate, yCoordinate } = getImageCoordinates();
                moveImage(newImgNameWithoutExtension, xCoordinate, yCoordinate);
            }

            if (internalCommand == 'RIGHT') {
                let newImgNameWithoutExtension = getRightRotationImage();
                let { xCoordinate, yCoordinate } = getImageCoordinates();
                moveImage(newImgNameWithoutExtension, xCoordinate, yCoordinate);
            }

            addTextToCommandDiv(internalCommand);
            if (internalCommand == 'REPORT') {
                let { xCoordinate, yCoordinate } = getImageCoordinates();
                let imgNameWithoutExtension = getImageName();
                let finalPosition = `Output: ${xCoordinate}, ${yCoordinate}, ${imgNameWithoutExtension.toUpperCase()}`;
                addTextToCommandDiv(finalPosition);
            }
        }
        addBreakToCommandDiv();
        if (index != toyRobotCommands.length - 1)
            clearImage();
        index = index + 1;
    }
});

function getRightRotationImage() {
    let imgNameWithoutExtension = getImageName();
    let newImgNameWithoutExtension = '';
    switch (imgNameWithoutExtension) {
        case 'north':
            newImgNameWithoutExtension = 'east';
            break;
        case 'east':
            newImgNameWithoutExtension = 'south';
            break;
        case 'west':
            newImgNameWithoutExtension = 'north';
            break;
        case 'south':
            newImgNameWithoutExtension = 'west';
            break;
    }
    return newImgNameWithoutExtension;
}

function getLeftRotationImage() {
    let imgNameWithoutExtension = getImageName();
    let newImgNameWithoutExtension = '';
    switch (imgNameWithoutExtension) {
        case 'north':
            newImgNameWithoutExtension = 'west';
            break;
        case 'east':
            newImgNameWithoutExtension = 'north';
            break;
        case 'west':
            newImgNameWithoutExtension = 'south';
            break;
        case 'south':
            newImgNameWithoutExtension = 'east';
            break;
    }
    return newImgNameWithoutExtension;
}

function moveImage(imgNameWithoutExtension, xCoordinate, yCoordinate) {
    if (xCoordinate < 0 || xCoordinate > 4 || yCoordinate < 0 || yCoordinate > 5) {
        addTextToCommandDiv('Robot may fall from the table.');
        return;
    }
    let targetDiv = document.querySelector('img').closest('div');
    clearDiv(targetDiv);
    targetDiv = document.querySelector(`.x-${xCoordinate} .y-${yCoordinate}`);
    const imgElement = document.createElement('img');
    imgElement.src = `${imgRelativePath}${imgNameWithoutExtension}.png`;
    imgElement.width = '60';
    targetDiv.appendChild(imgElement);
}

function robotFallFromTable() {
    addTextToCommandDiv('Robot may fall from the table.');
    return;
}

function getImageCoordinates() {
    let xCoordinate = document.querySelector('img').closest('tr').className.split('-')[1];
    let yCoordinate = document.querySelector('img').closest('div').className.split('-')[1];
    return { xCoordinate, yCoordinate };
}

function getImageName() {
    let imgPathArrayLength = document.querySelector('img').src.split('/').length;
    let imgNameWithExtension = document.querySelector('img').src.split('/')[imgPathArrayLength - 1];
    return imgNameWithExtension.split('.')[0];
}

function clearImage() {
    if(document.querySelector('img') != null)
        document.querySelector('img').closest('div').innerHTML = '';
}

function addTextToCommandDiv(text) {
    let labelElement = document.createElement('label');
    labelElement.textContent = text;
    document.getElementById('commandDiv').appendChild(labelElement);
    addBreakToCommandDiv();
}

function addBreakToCommandDiv() {
    let commandDiv = document.getElementById('commandDiv');
    commandDiv.appendChild(document.createElement('br'));
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function clearDiv(targetDiv) {
    targetDiv.innerHTML = '';
}

function transformCommands(commands) {
    let commandArray = commands.split('\r\n');
    let tempCommandArray = [];
    for (let command of commandArray) {
        if (command == '') {
            toyRobotCommands.push(tempCommandArray);
            tempCommandArray = [];
        } else
            tempCommandArray.push(command);
    }
    toyRobotCommands.push(tempCommandArray);
}